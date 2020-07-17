import  crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {config} from '../config/config.mjs';
import {userdb} from '../models/user_model.mjs';


function encryptData(data,iv) {
 let cipher = crypto.createCipheriv(config.algorithm, Buffer.from(config.encryption_key), iv);
 let encrypted = cipher.update(data);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return encrypted.toString('hex');
}
function encryptDataStringSalt(data,iv)
{
	iv = Buffer.from(iv, 'hex');
	let cipher = crypto.createCipheriv(config.algorithm, Buffer.from(config.encryption_key), iv);
	let encrypted = cipher.update(data);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return encrypted.toString('hex');
}

function decryptData(data,iv) {
	iv = Buffer.from(iv, 'hex');
	let encryptedText = Buffer.from(data, 'hex');
	let decipher = crypto.createDecipheriv(config.algorithm, Buffer.from(config.encryption_key), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}

function encryptPassword(data)
{
	var salt=crypto.randomBytes(16);
	var salt_string=salt.toString('hex');
	var hash=crypto.pbkdf2Sync(data, salt_string, 1000, 64, "sha512").toString('hex');
	return {password:hash,salt:salt,salt_string:salt_string};
}
function encryptMD5Password(data)
{
	const crypto = require('crypto');
	const hash = crypto.createHash('md5');

	hash.update(data);
	return hash.digest('hex');
}
function encryptPasswordWithSalt(newpassword,salt)
{
	var hash=crypto.pbkdf2Sync(newpassword,salt,1000,64,"sha512").toString("hex");
	return hash;
}

function generateToken(data)
{
	try
	{
		// console.log(data);
		var token = jwt.sign(data, config.encryption_key);
		return {"status":"success","msg":token,"error":""};
	}
	catch(e)
	{
		// console,log(e);
		return {"status":"unsuccess","msg":"","error":e.message};
	}
}
async function validateToken(data)
{
	try
	{
		var token = jwt.verify(data, config.encryption_key);
		const userResponse=await userdb.validateToken(token);
		if(!userResponse)
		{
			return {"status":"login","msg":"","error":"Invalid user details."};
		}
		return {"status":"success","msg":token,"error":""};
	}
	catch(e)
	{
		
		return {"status":"unsuccess","msg":"","error":e.message};
	}
}

export let encrypt={
	encrypt:encryptData,
	decrypt:decryptData,
	password:encryptPassword,
	passwordmd5:encryptMD5Password,
	generateToken:generateToken,
	verifyToken:validateToken,
	encryptWithStringSalt:encryptDataStringSalt,
	passwordWithSaltString:encryptPasswordWithSalt
}