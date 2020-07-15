import {config} from "../config/config.mjs";
import datetime from "node-datetime";

function getDateTime(format)
{
	try
	{
		if(format=="" || format==undefined)
			format='d/m/Y H:M:S';
		
		let dt=datetime.create();

		return ""+dt.format(format);
	}
	catch(e)
	{
		console.log(e);
		let dt=datetime.create();		
		return ""+dt.format(config.date_format);
	}
}
function convertDateTime(dateString)
{
	try
	{
		var dt=datetime.create(dateString);

		return ""+dt.format(config.date_format);
	}
	catch(e)
	{
		var dt=datetime.create();		
		return ""+dt.format(config.date_format);
	}
}
function nextVerificationDate(noOfDays)
{
	try 
	{
		var dt=datetime.create();

		dt.offsetInDays(noOfDays);

		if(dt.format("W")=="Saturday")
			dt.offsetInDays(2);
			
		if( dt.format("W")=="Sunday")
			dt.offsetInDays(1);
		
		return dt.format(config.db_date_format);
	}
	catch (error) 
	{
		console.log(error);
		var dt=datetime.create();
		return dt.format(config.db_date_format);;
	}
}
function dateCompareToToday(oldDate)
{
	try 
	{
		var dt=datetime.create(oldDate);
		var dt1=datetime.create();

		return (dt1>=dt);
	} catch (error) 
	{
		console.log(error);
		return false;
	}
}
export let dateTime={
	get:getDateTime,
	convert:convertDateTime,
	nextDate:nextVerificationDate,
	compareToday:dateCompareToToday
};
// module.exports.get=getDateTime;
// module.exports.convert=convertDateTime;
// module.exports.nextDate=nextVerificationDate;
// module.exports.compareToday=dateCompareToToday;