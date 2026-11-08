import { hashSync } from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../config/auth.js';

export function encriptarClave(clavePlana){
    return hashSync(clavePlana,BCRYPT_SALT_ROUNDS);
}