
import PostgreIntegration from '../../dist/plugins/integrations/PostgreIntegration';
import ThundraTracer from '../../dist/opentracing/Tracer';
import PG from './utils/pg.integration.utils';
import InvocationSupport from '../../dist/plugins/support/InvocationSupport';


describe('PostgreSQL Integration', () => {
    InvocationSupport.setFunctionName('functionName');

    test('should instrument PostgreSQL calls ', () => {
        const integration = new PostgreIntegration({});
        const sdk = require('pg');
        integration.wrap(sdk, {});

        const tracer = new ThundraTracer();

        return PG.select(sdk).then((data) => {
            const span = tracer.getRecorder().spanList[0];

            expect(span.className).toBe('POSTGRESQL');
            expect(span.domainName).toBe('DB');

            expect(span.tags['operation.type']).toBe('READ');
            expect(span.tags['db.instance']).toBe('postgres');
            expect(span.tags['db.user']).toBe('postgres');
            expect(span.tags['db.host']).toBe('localhost');
            expect(span.tags['db.port']).toBe(5432);
            expect(span.tags['db.type']).toBe('postgresql');
            expect(span.tags['db.statement']).toBe('SELECT Hello world!::text as message');
            expect(span.tags['topology.vertex']).toEqual(true);
            expect(span.tags['trigger.domainName']).toEqual('API');
            expect(span.tags['trigger.className']).toEqual('AWS-Lambda');
            expect(span.tags['trigger.operationNames']).toEqual(['functionName']);
        });
    });
});
