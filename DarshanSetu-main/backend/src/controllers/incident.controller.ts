import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getIncidentRecommendations, triggerModelRetraining } from '../services/recommendation.service';
import { sendEmergencyAlert } from '../services/notification.service';


const prisma = new PrismaClient();

// POST /api/incidents/sos
export const raiseSOS = async (req: Request, res: Response) => {
  const { siteId, zoneId, type, severity, description, lat, lng } = req.body;

  if (!siteId || !type || !description) {
    return res.status(400).json({ error: 'siteId, type, and description are required' });
  }

  try {
    const incident = await prisma.incident.create({
      data: {
        siteId,
        zoneId,
        type, // STAMPEDE_PRECURSOR, MEDICAL_FALL, SOS_MANUAL
        severity: severity || 'WARNING',
        description,
        lat,
        lng
      }
    });

    // Broadcast new incident to all active dashboards
    (req as any).io.emit('new_incident', incident);

    // If incident is CRITICAL, dispatch emergency SMS alerts to guards
    if (incident.severity === 'CRITICAL') {
      sendEmergencyAlert(incident);
    }

    res.status(201).json({
      message: 'SOS incident raised successfully',
      incident
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log SOS incident' });
  }
};

// POST /api/incidents/:id/recommend
export const getRecommendation = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    // Call Python recommender
    const recommendations = await getIncidentRecommendations({
      lat: incident.lat || 12.9716,
      lng: incident.lng || 77.5946,
      type: incident.type,
      severity: incident.severity,
    });

    // Update database row
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        suggestedDuration: recommendations.predicted_duration,
        suggestedMarshals: recommendations.recommended_marshals,
        suggestedBarricades: recommendations.recommended_barricading,
        suggestedDiversion: recommendations.recommended_diversion,
      },
    });

    res.json({
      message: 'Recommendations generated successfully',
      recommendations,
      incident: updatedIncident,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
  }
};

// PUT /api/incidents/:id/feedback
export const submitFeedback = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { actualDuration, actualMarshals, actualBarricades, actualDiversion } = req.body;

  try {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    // Determine if operator overrode suggested values
    const overridden = 
      (actualMarshals !== undefined && actualMarshals !== incident.suggestedMarshals) ||
      (actualBarricades !== undefined && actualBarricades !== incident.suggestedBarricades) ||
      (actualDiversion !== undefined && actualDiversion !== incident.suggestedDiversion);

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        actualDuration: parseFloat(actualDuration),
        operatorOverrides: overridden,
      },
    });

    // Check count of resolved incidents with feedback
    const feedbackCount = await prisma.incident.count({
      where: { actualDuration: { not: null } }
    });

    // Trigger retraining loop in background if count is a multiple of 5
    if (feedbackCount > 0 && feedbackCount % 5 === 0) {
      console.log(`🔄 Triggering automated ML retraining (Feedback count: ${feedbackCount})...`);

       // Broadcast retraining running status
      (req as any).io.emit('ml_retraining_status', { status: 'running', count: feedbackCount });
      
      const feedbackList = await prisma.incident.findMany({
        where: { actualDuration: { not: null } }
      });

      triggerModelRetraining(feedbackList)
        .then((output) => {
          console.log('✅ ML Retraining successful:\n', output);
           // Broadcast retraining success status
          (req as any).io.emit('ml_retraining_status', { status: 'success', output });
        })
        .catch((err) => {
          console.error('❌ ML Retraining failed:', err.message);
            // Broadcast retraining failed status
          (req as any).io.emit('ml_retraining_status', { status: 'failed', error: err.message });
        });
    }

    res.json({
      message: 'Feedback submitted successfully',
      incident: updatedIncident,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit operator feedback' });
  }
};