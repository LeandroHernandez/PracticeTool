
const authRoot = 'auth';
enum auth {
    emailAlreadyInUse = `${authRoot}/email-already-in-use`,
    invalidCredential = `${authRoot}/invalid-credential`,
}

export const firebaseErrors = {
    auth
}