import sys, os
sys.path.insert(0, os.path.abspath('natal_chart'))
from calculations import get_houses_and_angles, calculate_julian_day
jd = calculate_julian_day("2000-01-01", "12:00:00", "UTC")
houses, angles = get_houses_and_angles(jd, 21.0, 105.0)
print(angles.keys())
