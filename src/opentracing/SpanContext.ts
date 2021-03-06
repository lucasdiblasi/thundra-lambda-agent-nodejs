import { SpanContext } from 'opentracing';

class ThundraSpanContext extends SpanContext {
  traceId: any;
  spanId: any;
  transactionId: any;
  parentId: any;
  sampled: any;
  baggageItems: any;

  constructor(props: any) {
    super();
    this.transactionId = props.transactionId;
    this.traceId = props.traceId;
    this.spanId = props.spanId;
    this.parentId = props.parentId || null;
    this.sampled = props.sampled === undefined || props.sampled;
    this.baggageItems = props.baggageItems || {};
  }
}

export default ThundraSpanContext;
