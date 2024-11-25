// This scenario show how to test for both latency and exceptions.
import http from "k6/http";
import { Rate, Trend, Counter } from "k6/metrics";

export let options = {
  vus       : 20,
  duration  : "10s",
  rps       : 200, //max requests per second, increase to go faster
  insecureSkipTLSVerify : true, //ignore that localhost cert doesn't match host.docker.internal
  thresholds: {
    '_200_OK_rate': ['rate>0.99'],
    '_200_OK_count': ['count>200'],
    'http_req_duration': ['p(95)<2000'],
    'http_req_duration': ['p(70)<200']
 }
}

export let TrendRTT = new Trend("RTT");
const myOkRate = new Rate("_200_OK_rate");
const myOkCounter = new Counter("_200_OK_count");

export default function() {
  let url = "http://localhost:5555/weatherforecast_challenge8";
  let urls = [url + "/1", url + "/2", url + "/3", url + "/4"];

  let rnd = Math.floor(Math.random() * 4);
  let response = http.get(urls[rnd]);
  let resOk = response.status === 200;
  TrendRTT.add(response.timings.duration);
  myOkRate.add(resOk);
  myOkCounter.add(resOk);
};

