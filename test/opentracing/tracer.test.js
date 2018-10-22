import ThundraTracer from '../../dist/opentracing/Tracer';
import { Reference } from 'opentracing';
import { Trace } from '../../dist/plugins/Trace';

describe('Recorder', () => {
    describe('constructor', () => {
        const tracer = new ThundraTracer({});
        it('should not init recorder sampler and active spans', () => {
            expect(tracer.recorder).toBeTruthy();
        });
    });

    describe('startSpan', () => {
        const tracer = new ThundraTracer({});
        const span1 = tracer.startSpan('operation-name-1');
        const span2 = tracer.startSpan('operation-name-2');
        it('should start span with given operation name', () => {
            expect(span1.getOperationName()).toBe('operation-name-1');
            expect(span2.getOperationName()).toBe('operation-name-2');
        });
    });

    describe('getActiveSpan', () => {
        const tracer = new ThundraTracer({});
        it('should return null when no active span', () => {
            expect(tracer.getActiveSpan()).toBe(undefined);
        });
    });

    describe('span.finish', () => {
        const tracer = new ThundraTracer({});
        const span = tracer.startSpan('operation-name-1');
        span.finish();
        it('should record span value to span tree', () => {
            expect(tracer.recorder.getSpanList()[0]).toBe(span);
        });
    });

    describe('tracer finishSpan()', () => {
        const tracer = new ThundraTracer({});
        const span = tracer.startSpan('operation-name-1');
        tracer.finishSpan();
        it('should record span value to span tree', () => {
            expect(tracer.recorder.getSpanList()[0]).toBe(span);
        });
    });

    describe('inject and extract', () => {
        const tracer = new ThundraTracer({});
        it('should throw exception with unsupported methods', () => {
            expect(() => { tracer.inject(); }).toThrow(new Error('Thundra Tracer does not support inject.'));
            expect(() => { tracer.extract(); }).toThrow(new Error('Thundra Tracer does not support extract.'));
        });
    });

    describe('Span parent child relation with child of reference', () => {
        const tracer = new ThundraTracer({});

        const parentSpan = tracer.startSpan('parent');
        parentSpan.setTag('tag-key', 'tagValue');
        parentSpan.log({ 'test-log': 'logValue' });

        const childSpan = tracer.startSpan('child', { childOf: parentSpan });

        childSpan.finish();
        parentSpan.finish();

        it('should set log and tag relations', () => {
            expect(tracer.recorder.getSpanList()[1].getOperationName()).toEqual('parent');
            expect(tracer.recorder.getSpanList()[1].getTag('tag-key')).toEqual('tagValue');
            expect(tracer.recorder.getSpanList()[1].logs[0].timestamp).not.toBeNull();
            expect(tracer.recorder.getSpanList().length).toEqual(2);
            expect(tracer.recorder.getSpanList()[0].getOperationName()).toEqual('child');
        });

    });

    describe('Span parent child relation with follows from reference', () => {
        const tracer = new ThundraTracer({});

        const parentSpan = tracer.startSpan('parent');
        const childSpan = tracer.startSpan('child', {
            references: [new Reference('follows_from', parentSpan.context())]
        });

        childSpan.finish();
        parentSpan.finish();

        it('should set log and tag relations', () => {
            expect(tracer.recorder.getSpanList()[1].getOperationName()).toEqual('parent');
            expect(tracer.recorder.getSpanList().length).toEqual(2);
            expect(tracer.recorder.getSpanList()[0].getOperationName()).toEqual('child');
        });

    });

    describe('Span setErrorTag', () => {
        const tracer = new ThundraTracer({});

        const span = tracer.startSpan('span');
        span.setErrorTag(new Error('Some thing failed.'));

        span.finish();

        it('should set log and tag relations', () => {
            expect(tracer.recorder.getSpanList()[0].getTag('error')).toEqual(true);
            expect(tracer.recorder.getSpanList()[0].getTag('error.kind')).toEqual('Error');
            expect(tracer.recorder.getSpanList()[0].getTag('error.message')).toEqual('Some thing failed.');
        });

    });

    describe('Tracer wrapper function', () => {
        const tracer = new ThundraTracer({});

        const userFunction = () => { };
        const wrappedFunction = tracer.wrapper('userFunction', userFunction);

        wrappedFunction();

        it('should wrap users code with start and finish span', () => {
            expect(tracer.recorder.getSpanList()[0].getOperationName()).toEqual('userFunction');
            expect(tracer.recorder.getSpanList().length).toEqual(1);
        });

    });

    describe('Tracer set/get beggage item', () => {
        const tracer = new ThundraTracer({});
        const span = tracer.startSpan('f1');
        span.setBaggageItem('test', 'value');

        it('should store values', () => {
            expect(span.getBaggageItem('test')).toEqual('value');
        });

    });

    describe('Tracer inject/extract', () => {
        const tracer = new ThundraTracer({});

        it('should throw exception', () => {
            expect(() => {
                tracer._extract();
            }).toThrow();

            expect(() => {
                tracer._inject();
            }).toThrow();

        });

    });
});