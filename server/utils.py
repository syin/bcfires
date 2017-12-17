#!/usr/bin/env python

import json
import math


def test_convex_hull():
    polygon = [[0, 0], [0, 1], [1, 0], [1, 1], [0.5, 0.5]]
    polygon_convex_hull = [[0, 0], [0, 1], [1, 0], [1, 1]]

    generated_points = convex_hull(polygon)
    print("generated_points", generated_points)
    assert sorted(generated_points) == sorted(polygon_convex_hull)


def compute_angle(start, end):
    angle = math.degrees(math.atan2(end[1] - start[1], end[0] - start[0]))
    angle_normalized = (angle + 360) % 360
    return angle_normalized


def convex_hull(polygon):
    x_min = min([point[0] for point in polygon])
    y_min = min([point[1] for point in polygon])
    bottom_left = [x_min, y_min]

    convex_hull = []
    start_point = bottom_left

    while True:
        angles = [compute_angle(point, start_point) for point in polygon]

        next_point_index, next_point_angle = min(enumerate(angles), key=lambda x: x[1])

        start_angle = compute_angle(bottom_left, start_point)

        if start_angle > 0 and start_angle < next_point_angle:
            break

        next_point = polygon[next_point_index]
        convex_hull.append(next_point)
        start_point = next_point
        del polygon[next_point_index]

    return convex_hull


def get_year_range():
    with open("../client/output_simplified.json", "r") as f:
        fires = json.loads(f.read())
        years = set([fire["properties"]["FIRE_YEAR"] for fire in fires["features"]])

        print(min(years), max(years))


def main():
    # get_year_range()
    test_convex_hull()


if __name__ == '__main__':
    main()
