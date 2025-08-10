export function createPageUrl(name) {
  switch (name) {
    case 'Messages':
      return '/messages';
    case 'Contacts':
      return '/contacts';
    case 'Settings':
      return '/settings';
    default:
      return '/';
  }
}


