import crypto from 'crypto';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

export class PiKycAdapter {
  /**
   * Verify Pi KYC proof and generate an identity layer and KYC proof.
   */
  static generateIdentity(piAuthResult) {
    const { user, accessToken, signature, publicKey } = piAuthResult;

    if (!user || !user.uid) {
      throw new Error('Invalid Pi Auth Result: Missing user.uid');
    }

    if (!accessToken || !signature || !publicKey) {
      throw new Error('Invalid Pi Auth Result: Missing token, signature, or public key');
    }

    if (typeof user.uid !== 'string' || user.uid.length < 3 || user.uid.length > 256) {
      throw new Error('Invalid Pi Auth Result: user.uid must be a non-empty string');
    }

    if (typeof accessToken !== 'string' || accessToken.length < 10 || accessToken.length > 8192) {
      throw new Error('Invalid Pi Auth Result: accessToken length is out of allowed bounds');
    }

    if (!PiKycAdapter.isValidBase64(signature) || !PiKycAdapter.isValidBase64(publicKey)) {
      throw new Error('Invalid Pi Auth Result: signature/publicKey must be valid base64');
    }

    // Verify the signature
    let isValid = false;
    try {
      const messageUint8 = naclUtil.decodeUTF8(accessToken);
      const signatureUint8 = naclUtil.decodeBase64(signature);
      const publicKeyUint8 = naclUtil.decodeBase64(publicKey);

      if (publicKeyUint8.length !== nacl.sign.publicKeyLength) {
        throw new Error('Invalid public key size');
      }
      if (signatureUint8.length !== nacl.sign.signatureLength) {
        throw new Error('Invalid signature size');
      }

      isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
    } catch (error) {
      throw new Error('Signature verification failed: malformed signature payload');
    }

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Generate SHA-256 hash of the UID
    const uidHash = crypto.createHash('sha256').update(user.uid).digest('hex').slice(0, 32);

    // Generate SHA-256 hash of the accessToken
    const accessTokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');

    const did = `did:axiom:axiomid.app:${uidHash}`;
    const timestamp = new Date().toISOString();

    const identity_layer = {
      id: did,
      authority: "axiomid.app",
      issuedAt: timestamp,
      publicKey: {
        algorithm: "Ed25519",
        value: publicKey,
        encoding: "base64"
      }
    };

        const kyc_proof = {
      provider: "pi_network",
      uid_hash: uidHash,
      verified_at: timestamp,
      access_token_hash: accessTokenHash
    };

    if (piAuthResult.vlaDevice) {
      kyc_proof.vla_device_registry = {
        adapter: piAuthResult.vlaDevice.adapter || 'generic',
        hardware_id: piAuthResult.vlaDevice.id || 'unknown'
      };
    }

return { identity_layer, kyc_proof };
  }

  static isValidBase64(value) {
    if (typeof value !== 'string' || value.length === 0 || value.length > 4096) return false;
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value);
  }
}
