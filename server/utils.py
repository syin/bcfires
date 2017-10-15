#!/usr/bin/env python

import json

def get_year_range():
    with open("../client/output_simplified.json", "r") as f:
        fires = json.loads(f.read())
        years = set([fire["properties"]["FIRE_YEAR"] for fire in fires["features"]])

        print(min(years), max(years))


def main():
    get_year_range()


if __name__ == '__main__':
    main()