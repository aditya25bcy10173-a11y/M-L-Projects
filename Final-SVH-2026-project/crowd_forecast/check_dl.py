import sys

for lib in ['torch', 'tensorflow', 'keras']:
    try:
        mod = __import__(lib)
        print(f"{lib} is installed. Version: {getattr(mod, '__version__', 'unknown')}")
    except ImportError:
        print(f"{lib} is NOT installed.")
