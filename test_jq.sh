#!/bin/bash
usage_total=0
usage_breakdown="Direct:0"
is_burst="false"

echo '{ "exports": [] }' > test.json
json_entry=$(jq -n \
    --arg usage "$usage_total" \
    --arg breakdown "$usage_breakdown" \
    --argjson burst "$is_burst" \
    '{usage:$usage,breakdown:$breakdown,burst:$burst}')
jq ".exports += [$json_entry]" "test.json" > "test.json.tmp" && mv "test.json.tmp" "test.json"
cat test.json
