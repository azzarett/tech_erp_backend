class AccessToken {
  token: string;
}

class RefreshToken {
  token: string;
}

export class Auth {
  access: AccessToken;
  refresh: RefreshToken;
}
