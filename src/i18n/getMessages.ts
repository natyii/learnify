import {type Locale} from './config';
export async function getMessages(locale: Locale) {
  switch (locale) {
    case 'am': return (await import('./messages/am/common.json')).default;
    case 'om': return (await import('./messages/om/common.json')).default;
    default:   return (await import('./messages/en/common.json')).default;
  }
}
