import fs from "fs";
import {dateTime} from "./date.mjs";
import  {config} from './config.mjs';

let logtype="info";
let info=function(log)
{
	logtype="info";
	if(config.log)
	{
		let message="\n"+logtype+":"+log;
		let todaydate=dateTime.get(config.log_date_format);
		// console.log(todaydate);
		fs.appendFile(config.log_folder+'log_'+todaydate+'.log',message,function(err){
			if(err)
				console.log(err);
		});
	}
}
let warning=function(log)
{
	logtype="warn";
	if(config.log)
	{
		let message="\n"+logtype+":"+log;
		let todaydate=dateTime.get(config.log_date_format);
		// console.log(todaydate);
		fs.appendFile(config.log_folder+'log_'+todaydate+'.log',message,function(err){
			if(err)
				console.log(err);
		});
	}
}
let error=function(log)
{
	logtype="error";
	if(config.log)
	{
		let message="\n"+logtype+":"+log;
		let todaydate=dateTime.get(config.log_date_format);
		// console.log(todaydate);
		fs.appendFile(config.log_folder+'log_'+todaydate+'.log',message,function(err){
			if(err)
				console.log(err);
		});
	}
}
let show=function(dateString)
{
	try
	{
		let data=fs.readFileSync(config.log_folder+'log_'+dateString+".log");

		return {"status":"success","msg":data,"error":""};
	}
	catch(e)
	{
		return {"status":"unsuccess","msg":"","error":e};
	}
}
export let log={
	info:info,
	error:error,
	warn:warning,
	show:show
}