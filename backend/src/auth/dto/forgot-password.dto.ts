export class ForgotPasswordDto {
  email: string;
}

export class VerifyResetCodeDto {
  email: string;
  code: string;
}

export class ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}
