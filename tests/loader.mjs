import { register } from 'node:module';

register(new URL('./custom-resolver.mjs', import.meta.url));
