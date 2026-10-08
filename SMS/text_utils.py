import re

def clean(s):
    s = str(s)
    s = re.sub(r"password\s*:\s*\S+", " passwordtoken ", s, flags=re.I)
    s = re.sub(r"https?://\S+|www\.\S+|\b(?:bit\.ly|t\.me|wa\.me)/\S+", " urltoken ", s, flags=re.I)
    s = re.sub(r"[xX*]{2,}", " maskedtoken ", s)
    s = re.sub(r"\d+", " numtoken ", s)
    return re.sub(r"\s+", " ", s).strip().lower()
