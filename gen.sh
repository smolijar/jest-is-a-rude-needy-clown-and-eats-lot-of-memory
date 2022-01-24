#!/bin/bash

rm -f jest/suite.*.test.js
rm -f mocha/suite.*.test.js
rm -f ava/suite.*.test.js
rm -f tap/suite.*.test.js

echo "SUIT_COUNT: $SUIT_COUNT"

for N in $(seq 1 $SUIT_COUNT)
do 
   cp "jest/suite.template.js" "jest/suite.$N.test.js"
   cp "mocha/suite.template.js" "mocha/suite.$N.test.js"
   cp "ava/suite.template.js" "ava/suite.$N.test.js"
   cp "tap/suite.template.js" "tap/suite.$N.test.js"
done