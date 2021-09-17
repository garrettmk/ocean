import { makeBrowseDocumentsMachine, BrowseDocumentsContext, BrowseDocumentsStates, BrowseDocumentsEvent, BrowseDocumentsMachine } from "@/client/viewmodels";
import { ClientDocumentsGateway } from "@/client/interfaces";
import { createTestPlans, StatesTestFunctions } from '@smartive/xstate-test-toolbox';
import { TestEventsConfig } from "@xstate/test/lib/types";
import { interpret, Interpreter } from 'xstate';
import { TestPromise } from '@/test/__utils__/TestPromise';
import { DocumentHeader } from "@/domain";
import { TestClientGateway } from '../../__utils__/TestClientGateway';




describe.skip('Testing BrowseDocumentsMachine...', () => {
  let gateway = new TestClientGateway();  
  let machine = makeBrowseDocumentsMachine(gateway as ClientDocumentsGateway);
  let service: Interpreter<BrowseDocumentsContext, BrowseDocumentsStates, BrowseDocumentsEvent>;
  
  type TestContext = {}

  beforeEach(() => {
    gateway.reset();
    // machine = makeBrowseDocumentsMachine(gateway as ClientDocumentsGateway);
    service = interpret(machine);
    service.start();
  });

  const tests: StatesTestFunctions<BrowseDocumentsContext, TestContext> = {
    loading: () => {
      expect(service.state.matches('loading'));
      // expect(gateway.listDocuments).toHaveBeenCalled();
      // expect(gateway.getLastResult<TestPromise>('listDocuments')?.state).toBe('pending');
    },

    fulfilled: () => {
      expect(service.state.matches('fulfilled'));
      // expect(gateway.getLastResult<TestPromise>('listDocuments')?.state).toBe('resolved');
    },

    error: () => {
      expect(service.state.matches('error'));
      // expect(gateway.getLastResult<TestPromise>('listDocuments')?.state).toBe('rejected');
    }
  };

  const testEvents: TestEventsConfig<TestContext> = {
    query: () => {
      service.send({ type: 'query' });
    },
    
    'done.invoke.listDocuments': () => {
      const promise = gateway.getLastResult<TestPromise<DocumentHeader[]>>('listDocuments');
      promise?.resolve([]);
    },
    
    'error.platform.listDocuments': () => {
      const promise = gateway.getLastResult<TestPromise<DocumentHeader[]>>('listDocuments');
      promise?.reject(new Error());
    },
  };

  createTestPlans({ machine, tests, testEvents }).forEach(plan => {
    plan.paths.forEach(path => {
      it(`Reaches state ${plan.state.toStrings()} via ${path.description}`, async () => {
        await path.test({});
      })
    })
  })
})