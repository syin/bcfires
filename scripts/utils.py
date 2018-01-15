#!/usr/bin/env python

import copy
import json
import math
import statistics


def test_convex_hull():
    # polygon = [[0, 0], [0, 1], [1, 0], [1, 1], [0.5, 0.5]]
    # polygon_convex_hull = [[0, 0], [0, 1], [1, 0], [1, 1]]

    polygon = [[1.5, 1.1], [3, 0.9], [4, 1.7], [5.3, 3], [5, 4], [4.3, 4.3], [3, 4], [2, 3.5],
               [1, 2], [3, 2]]
    polygon_convex_hull = [[1.5, 1.1], [3, 0.9], [4, 1.7], [5.3, 3], [5, 4], [4.3, 4.3], [3, 4], [2, 3.5],
                           [1, 2]]

    generated_points = convex_hull(polygon)
    print("generated_points", generated_points)
    assert sorted(generated_points) == sorted(polygon_convex_hull)


def compute_angle(prev, start, end):

    angle = math.degrees(math.atan2(end[1] - start[1], end[0] - start[0]))
    angle = (angle + 360) % 360
    if prev:
        offset = math.degrees(math.atan2(prev[1] - start[1], prev[0] - start[0]))
        offset = (offset + 360) % 360
    else:
        offset = 90

    net_angle = (angle - offset + 360) % 360
    return net_angle


def convex_hull(polygon):
    print("number of points before:", len(polygon))
    polygon = [list(item) for item in set(tuple(row) for row in polygon)]  # remove duplicates

    start_point = min((val, i) for (i, val) in enumerate(polygon))
    del polygon[start_point[1]]
    start_point = start_point[0]
    convex_hull = [start_point]

    while True:
        prev_point = convex_hull[-2] if len(convex_hull) > 1 else None
        angles = [compute_angle(prev_point, start_point, point) for point in polygon]

        if not angles:
            # no more points to add
            break

        next_point_index, next_point_angle = min(enumerate(angles), key=lambda x: x[1])

        start_angle = 0
        if len(convex_hull) > 1:
            start_angle = compute_angle(prev_point, start_point, convex_hull[0])

        if start_angle > 0 and start_angle < next_point_angle:
            # the next point in the convex hull would be the starting point ("closing" the polygon)
            break

        next_point = polygon[next_point_index]
        convex_hull.append(next_point)
        start_point = next_point
        del polygon[next_point_index]

    print("number of points after:", len(convex_hull), "\n ------------")
    convex_hull.reverse()
    return convex_hull


def padded(polygon):
    c = 0.2  # amount of padding, constant

    midpoint_x = statistics.mean([point[0] for point in polygon])
    midpoint_y = statistics.mean([point[1] for point in polygon])

    for i, point in enumerate(polygon):
        x = point[0] - midpoint_x
        y = point[1] - midpoint_y

        theta = math.atan2(y, x)
        h = x / (math.cos(theta))

        x_prime = math.cos(theta) * (h + c)
        y_prime = math.sin(theta) * (h + c)

        new_point = [x_prime + midpoint_x, y_prime + midpoint_y]

        polygon[i] = new_point

    return polygon


def generate_test_file():
    with open("../client/output_simplified.json", "r") as f:
        fires = json.loads(f.read())
        filtered = [fire for fire in fires["features"] if fire["properties"]["FIRE_YEAR"] == 2010]
        filtered.sort(key=lambda x: x["properties"]["SIZE_HA"], reverse=True)
        filtered = filtered[:2]

        with open("../client/output_simplified_test.json", "w") as fout:
            out = {"features": filtered}
            fout.write(json.dumps(out))


def generate_convex_hulls():
    with open("../client/output_simplified.json", "r") as f:
        fires = json.loads(f.read())

        convex_hull_fires = []
        for fire in fires["features"]:
            convex_hull_fire = copy.deepcopy(fire)
            if fire["geometry"]["type"] == "Polygon":
                # the first element of a Polygon is the external ring
                polygon = fire["geometry"]["coordinates"][0]
                convex_hull_fire["geometry"]["coordinates"] = [padded(convex_hull(polygon))]
            elif fire["geometry"]["type"] == "MultiPolygon":
                # a MultiPolygon is an array of Polygons
                # take the first array (outer ring) of each Polygon
                convex_hull_fire["geometry"]["coordinates"] = []
                for polygon in fire["geometry"]["coordinates"]:
                    convex_hull_fire["geometry"]["coordinates"].append([padded(convex_hull(polygon[0]))])

            convex_hull_fires.append(convex_hull_fire)

        with open("../client/output_simplified_padded.json", "w") as fout:
            fout.write(json.dumps(convex_hull_fires))


def get_year_range():
    with open("../client/output_simplified.json", "r") as f:
        fires = json.loads(f.read())
        years = set([fire["properties"]["FIRE_YEAR"] for fire in fires["features"]])

        print(min(years), max(years))


def main():
    # get_year_range()
    # test_convex_hull()
    # generate_test_file()
    generate_convex_hulls()


if __name__ == '__main__':
    main()
