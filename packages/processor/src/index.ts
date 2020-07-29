import {Example, krijtje, sum, times} from '@monorepo/core';
import moment from "moment";

const x: Example = {
  id: '12',
  name: 'Example'
}

console.log(
  x,
  sum(12, 19),
  krijtje('blauwtje'),
  moment().format('MMMM Do YYYY, h:mm:ss a'),
  times(2, 4)
);