import {
  App,
  Aspects,
} from 'aws-cdk-lib';


import {
  BootstraplessStackSynthesizer,
  BatchJobDefinition,
} from 'cdk-bootstrapless-synthesizer';

import {
  MainStack,
} from './molecular-unfolding/cdk/stack-main';


const app = new App();

new MainStack(app, 'QCStack', {
  synthesizer: newSynthesizer(),
});

// below lines are required if your application has Docker assets
if (process.env.USE_BSS) {
  Aspects.of(app).add(new BatchJobDefinition());
}

app.synth();

function newSynthesizer() {
  return process.env.USE_BSS ? new BootstraplessStackSynthesizer() : undefined;
}