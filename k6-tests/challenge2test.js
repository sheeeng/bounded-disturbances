    // The next challenge introduces latency of 1 second to 10% of dependencies using Simmy.
    // Notice that the chaos must be wrapped as the last argument so that it runs inside the retries (try changing that...?)
    // Change the policy in Challenge2Controller.cs

import http from "k6/http";
import { Rate, Counter, Trend } from "k6/metrics";

// Given that 10% of a Method internal in the API has an additional latency of 1 second
// When we load test the API With 500 RPS for 6 Seconds
// Then we expect
// - the failure rate of the API to be less than 85%
// - the latency of the 95th percentile to be less than 200ms

export let options = {
  vus       : 50,
  duration  : "6s",
  rps       : 500, //max requests per second, increase to go faster
  insecureSkipTLSVerify : true, //ignore that localhost cert doesn't match host.docker.internal
  thresholds: {
    '200 OK rate': ['rate>0.85'],
    '200 OK count': ['count>200'],
    'http_req_duration': ['p(95)<200']
 }
}

export let TrendRTT = new Trend("RTT");
const myOkRate = new Rate("200 OK rate");
const myOkCounter = new Counter("200 OK count");

export default function() {
  let response = http.get("http://localhost:5000/weatherforecast_challenge2");
  let resOk = response.status === 200;
  myOkRate.add(resOk);
  myOkCounter.add(resOk);

  TrendRTT.add(response.timings.duration);
};
