#!/usr/bin/env python
import json

def load_map():
    with open("../rawdata/canada.geojson", "r") as f:
        provs = json.loads(f.read())
        # print(provs.features)
        features = [prov for prov in provs["features"] if prov["properties"]["NAME"] == "British Columbia"]
        provs["features"] = features

        with open("../client/bcmap.geojson", "w") as fout:
            fout.write(json.dumps(provs))


def main():
    load_map()


if __name__ == '__main__':
    main()