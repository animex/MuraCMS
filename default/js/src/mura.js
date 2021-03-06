/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */

;(function(root){

	function login(username,password,siteid){
		siteid=siteid || root.mura.siteid;

		return new Promise(function(resolve,reject) {
			root.mura.ajax({
					async:true,
					type:'post',
					url:root.mura.apiEndpoint,
					data:{
						siteid:siteid,
						username:username,
						password:password,
						method:'login'
					},
					success:function(resp){
						resolve(resp.data);
					}
			});
		});

	}


	function logout(siteid){
		siteid=siteid || root.mura.siteid;

		return new Promise(function(resolve,reject) {
			root.mura.ajax({
					async:true,
					type:'post',
					url:root.mura.apiEndpoint,
					data:{
						siteid:siteid,
						method:'logout'
					},
					success:function(resp){
						resolve(resp.data);
					}
			});
		});

	}

	function escapeHTML(str) {
	    var div = document.createElement('div');
	    div.appendChild(document.createTextNode(str));
	    return div.innerHTML;
	};

	// UNSAFE with unsafe strings; only use on previously-escaped ones!
	function unescapeHTML(escapedStr) {
	    var div = document.createElement('div');
	    div.innerHTML = escapedStr;
	    var child = div.childNodes[0];
	    return child ? child.nodeValue : '';
	};

	function renderFilename(filename,params){

		var query = [];
		params = params || {};
		params.filename= params.filename || '';
		params.siteid= params.siteid || root.mura.siteid;

	    for (var key in params) {
	    	if(key != 'entityname' && key != 'filename' && key != 'siteid' && key != 'method'){
	        	query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
	    	}
	    }

		return new Promise(function(resolve,reject) {
			root.mura.ajax({
					async:true,
					type:'get',
					url:root.mura.apiEndpoint + params.siteid + '/content/_path/' + filename + '?' + query.join('&'),
					success:function(resp){
						if(typeof resolve == 'function'){
							var item=new root.mura.Entity();
							item.set(resp.data);
							resolve(item);
						}
					}
			});
		});

	}
	function getEntity(entityname,siteid){
		if(typeof entityname == 'string'){
			var properties={entityname:entityname};
			properties.siteid = siteid || root.mura.siteid;
		} else {
			properties=entityname;
			properties.entityname=properties.entityname || 'content';
			properties.siteid=properties.siteid || root.mura.siteid;
		}

		if(root.mura.entities[properties.entityname]){
			return new root.mura.entities[properties.entityname](properties);
		} else {
			return new root.mura.Entity(properties);
		}
	}

	function getFeed(entityname){
		return new root.mura.Feed(mura.siteid,entityname);
	}

	function findQuery(params){

		params=params || {};
		params.entityname=params.entityname || 'content';
		params.siteid=params.siteid || mura.siteid;
		params.method=params.method || 'findQuery';

		return new Promise(function(resolve,reject) {

			root.mura.ajax({
					type:'get',
					url:root.mura.apiEndpoint,
					data:params,
					success:function(resp){
							var collection=new root.mura.EntityCollection(resp.data)

							if(typeof resolve == 'function'){
								resolve(collection);
							}
						}
			});
		});
	}

	function evalScripts(el) {
	    if(typeof el=='string'){
	    	el=parseHTML(el);
	    }

	    var scripts = [];
	    var ret = el.childNodes;

	    for ( var i = 0; ret[i]; i++ ) {
	      if ( scripts && nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
	            scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );
	        } else if(ret[i].nodeType==1 || ret[i].nodeType==9 || ret[i].nodeType==11){
	        	evalScripts(ret[i]);
	        }
	    }

	    for(script in scripts){
	      evalScript(scripts[script]);
	    }
	}

	function nodeName( el, name ) {
	    return el.nodeName && el.nodeName.toUpperCase() === name.toUpperCase();
	}

  	function evalScript(el) {
	    var data = ( el.text || el.textContent || el.innerHTML || "" );

	    var head = document.getElementsByTagName("head")[0] || document.documentElement,
	    script = document.createElement("script");
	    script.type = "text/javascript";
	    //script.appendChild( document.createTextNode( data ) );
		script.text=data;
	    head.insertBefore( script, head.firstChild );
	    head.removeChild( script );

	    if ( el.parentNode ) {
	        el.parentNode.removeChild( el );
	    }
	}

	function changeElementType(el, to) {
		var newEl = document.createElement(to);

		// Try to copy attributes across
		for (var i = 0, a = el.attributes, n = a.length; i < n; ++i)
		el.setAttribute(a[i].name, a[i].value);

		// Try to move children across
		while (el.hasChildNodes())
		newEl.appendChild(el.firstChild);

		// Replace the old element with the new one
		el.parentNode.replaceChild(newEl, el);

		// Return the new element, for good measure.
		return newEl;
	}

	function ready(fn) {
	    if(document.readyState != 'loading'){
	      //IE set the readyState to interative too early
	      setTimeout(fn,1);
	    } else {
	      document.addEventListener('DOMContentLoaded',function(){
	        fn();
	      });
	    }
	  }

	function get(url,data){
		return new Promise(function(resolve, reject) {
			return ajax({
					type:'get',
					url:url,
					data:data,
					success:function(resp){
						resolve(resp);
					},
					error:function(resp){
						reject(resp);
					}
				}
			);
 		});

	}

	function post(url,data){
		return new Promise(function(resolve, reject) {
			return ajax({
					type:'post',
					url:url,
					data:data,
					success:function(resp){
						resolve(resp);
					},
					error:function(resp){
						reject(resp);
					}
				}
			);
 		});

	}

	function isXDomainRequest(url){
		function getHostName(url) {
		    var match = url.match(/:\/\/([0-9]?\.)?(.[^/:]+)/i);
		    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
		    	return match[2];
		    } else {
		        return null;
		    }
		}


		function getDomain(url) {
		    var hostName = getHostName(url);
		    var domain = hostName;

		    if (hostName != null) {
		        var parts = hostName.split('.').reverse();

		        if (parts != null && parts.length > 1) {
		            domain = parts[1] + '.' + parts[0];

		            if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
		              domain = parts[2] + '.' + domain;
		            }
		        }
		    }

		    return domain;
		}

		var requestDomain=getDomain(url);

		return (requestDomain && requestDomain != location.host);

	}

	function ajax(params){

		//params=params || {};

		if(!('type' in params)){
			params.type='GET';
		}

		if(!('success' in params)){
			params.success=function(){};
		}

		if(!('error' in params)){
			params.error=function(){};
		}

		if(!('data' in params)){
			params.data={};
		}

		if(!(typeof FormData != 'undefined' && params.data instanceof FormData)){
			params.data=mura.deepExtend({},params.data);

			for(var p in params.data){
				if(typeof params.data[p] == 'object'){
					params.data[p]=JSON.stringify(params.data[p]);
				}
			}
		}

		if(!('xhrFields' in params)){
			params.xhrFields={ withCredentials: true };
		}

		if(!('crossDomain' in params)){
			params.crossDomain=true;
		}

		if(!('async' in params)){
			params.async=true;
		}

		if(!('headers' in params)){
			params.headers={};
		}

		var request = new XMLHttpRequest();

		if(params.crossDomain){
			if (!("withCredentials" in request)
				&& typeof XDomainRequest != "undefined" && isXDomainRequest(params.url)) {
			    // Check if the XMLHttpRequest object has a "withCredentials" property.
			    // "withCredentials" only exists on XMLHTTPRequest2 objects.
			    // Otherwise, check if XDomainRequest.
			    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.

				request =new XDomainRequest();

			}
		}

		request.onreadystatechange = function() {
			if(request.readyState == 4) {
   	 		  	//IE9 doesn't appear to return the request status
   	      		if(typeof request.status == 'undefined' || (request.status >= 200 && request.status < 400)) {

					try{
   	 			    	var data = JSON.parse(request.responseText);
   	 			    } catch(e){
   	 			    	var data = request.responseText;
   	 			    }

   	 			    params.success(data,request);
   	 			} else {
   	 			   	params.error(request);
   	 			}
			}
		}

		if(params.type.toLowerCase()=='post'){
			request.open(params.type.toUpperCase(), params.url, params.async);

			for(var p in params.xhrFields){
				if(p in request){
					request[p]=params.xhrFields[p];
				}
			}

			for(var h in params.headers){
				request.setRequestHeader(p,params.headers[h]);
			}

			//if(params.data.constructor.name == 'FormData'){
			if(typeof FormData != 'undefined' && params.data instanceof FormData){
				request.send(params.data);
			} else {
				request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
				var query = [];

			    for (var key in params.data) {
			        query.push($escape(key) + '=' + $escape(params.data[key]));
			    }

			    query=query.join('&');

				setTimeout(function () {
				   request.send(query);
				 }, 0);
			}
		} else {
			if(params.url.indexOf('?') == -1){
				params.url += '?';
			}

			var query = [];

		    for (var key in params.data) {
		        query.push($escape(key) + '=' + $escape(params.data[key]));
		    }

		    query=query.join('&');

			request.open(params.type.toUpperCase(), params.url + '&' +  query, params.async);

			for(var p in params.xhrFields){
				if(p in request){
					request[p]=params.xhrFields[p];
				}
			}

			for(var h in params.headers){
				request.setRequestHeader(p,params.headers[h]);
			}

			setTimeout(function () {
			   request.send();
			 }, 0);
		}

	}

	function generateOauthToken(grant_type,client_id,client_secret){
		return new Promise(function(resolve,reject) {
			get(mura.apiEndpoint.replace('/json/','/rest/') + 'oauth/token?grant_type=' + encodeURIComponent(grant_type) + '&client_id=' + encodeURIComponent(client_id) + '&client_secret=' + encodeURIComponent(client_secret)).then(function(resp){
				if(resp.data != 'undefined'){
					resolve(resp.data);
				} else {
					if(typeof reject=='function'){
						reject(resp);
					}
				}
			})
		});
	}

	function each(selector,fn){
		select(selector).each(fn);
	}

	function on(el,eventName,fn){
		if(eventName=='ready'){
			mura.ready(fn);
		} else {
			if(typeof el.addEventListener == 'function'){
				el.addEventListener(
					eventName,
					function(event){
						fn.call(el,event);
					},
					true
				);
			}
		}
	}

	function trigger(el, eventName, eventDetail) {
      	var eventClass = "";

      	switch (eventName) {
          	case "click":
          	case "mousedown":
          	case "mouseup":
              	eventClass = "MouseEvents";
              	break;

          	case "focus":
          	case "change":
          	case "blur":
          	case "select":
              	eventClass = "HTMLEvents";
              	break;

          default:
              	eventClass = "Event";
              	break;
       	}

      	var bubbles=eventName == "change" ? false : true;

		if(document.createEvent){
	    	var event = document.createEvent(eventClass);
	    	event.initEvent(eventName, bubbles, true);
	    	event.synthetic = true;
			el.dispatchEvent(event);

		} else {
			try{
				document.fireEvent("on" + eventName);
			} catch(e){
				console.warn("Event failed to fire due to legacy browser: on" + eventName);
			}
		}


  	};

	function off(el,eventName,fn){
		el.removeEventListener(eventName,fn);
	}

	function parseSelection(selector){
		if(typeof selector == 'object' && Array.isArray(selector)){
			var selection=selector;
		} else if(typeof selector== 'string'){
			var selection=nodeListToArray(document.querySelectorAll(selector));
		} else {
			if((typeof StaticNodeList != 'undefined' && selector instanceof StaticNodeList) || selector instanceof NodeList || selector instanceof HTMLCollection){
				var selection=nodeListToArray(selector);
			} else {
				var selection=[selector];
			}
		}

		if(typeof selection.length == 'undefined'){
			selection=[];
		}

		return selection;
	}

	function isEmptyObject(obj){
		return (typeof obj != 'object' || Object.keys(obj).length == 0);
	}

	function filter(selector,fn){
		return select(parseSelection(selector)).filter(fn);
	}

	function nodeListToArray(nodeList){
		var arr = [];
		for(var i = nodeList.length; i--; arr.unshift(nodeList[i]));
		return arr;
	}

	function select(selector){
		return new root.mura.DOMSelection(parseSelection(selector),selector);
	}

	function parseHTML(str) {
	  var tmp = document.implementation.createHTMLDocument();
	  tmp.body.innerHTML = str;
	  return tmp.body.children;
	};

	function getData(el){
		var data = {};
		Array.prototype.forEach.call(el.attributes, function(attr) {
		    if (/^data-/.test(attr.name)) {
		        data[attr.name.substr(5)] = parseString(attr.value);
		    }
		});

		return data;
	}

	function getProps(el){
		var data = {};
		Array.prototype.forEach.call(el.attributes, function(attr) {
		    if (/^data-/.test(attr.name)) {
		        data[attr.name.substr(5)] = parseString(attr.value);
		    }
		});

		return data;
	}


	function isNumeric(val) {
		return Number(parseFloat(val)) == val;
	}

	function parseString(val){
		if(typeof val == 'string'){
			var lcaseVal=val.toLowerCase();

			if(lcaseVal=='false'){
				return false;
			} else if (lcaseVal=='true'){
				return true;
			} else {
				if(isNumeric(val)){
					var numVal=parseFloat(val);
					if(numVal==0 || !isNaN(1/numVal)){
						return numVal;
					}
				}

				try {
			        var jsonVal=JSON.parse(val);
			        return jsonVal;
			    } catch (e) {
			        return val;
			    }

			}
		} else {
			return val;
		}

	}

	function getAttributes(el){
		var data = {};
		Array.prototype.forEach.call(el.attributes, function(attr) {
		       data[attr.name] = attr.value;
		});

		return data;
	}

	function formToObject(form) {
	    var field, s = {};
	    if (typeof form == 'object' && form.nodeName == "FORM") {
	        var len = form.elements.length;
	        for (i=0; i<len; i++) {
	            field = form.elements[i];
	            if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
	                if (field.type == 'select-multiple') {
	                    for (j=form.elements[i].options.length-1; j>=0; j--) {
	                        if(field.options[j].selected)
	                            s[s.name] = field.options[j].value;
	                    }
	                } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
	                    s[field.name ] =field.value;
	                }
	            }
	        }
	    }
	    return s;
	}

	//http://youmightnotneedjquery.com/
	function extend(out) {
	  	out = out || {};

	  	for (var i = 1; i < arguments.length; i++) {
		    if (!arguments[i])
		      continue;

		    for (var key in arguments[i]) {
		      if (typeof arguments[i].hasOwnProperty != 'undefined' && arguments[i].hasOwnProperty(key))
		        out[key] = arguments[i][key];
		    }
	  	}

	  	return out;
	};

	function deepExtend(out) {
		out = out || {};

		for (var i = 1; i < arguments.length; i++) {
		    var obj = arguments[i];

		    if (!obj)
	      	continue;

		    for (var key in obj) {

		        if (typeof arguments[i].hasOwnProperty != 'undefined' && arguments[i].hasOwnProperty(key)) {
		        	if(Array.isArray(obj[key])){
		       			out[key]=obj[key].slice(0);
			        } else if (typeof obj[key] === 'object') {
			          	out[key]=deepExtend({}, obj[key]);
			        } else {
			          	out[key] = obj[key];
			        }
		      	}
		    }
		}

	  	return out;
	}

	function createCookie(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}

	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length,c.length));
		}
		return "";
	}

	function eraseCookie(name) {
		createCookie(name,"",-1);
	}

	function $escape(value){
		if(typeof encodeURIComponent != 'undefined'){
			return encodeURIComponent(value)
		} else {
			return escape(value).replace(
	       	 	new RegExp( "\\+", "g" ),
	        	"%2B"
	        ).replace(/[\x00-\x1F\x7F-\x9F]/g, "");
		}
	}

	function $unescape(value){
		return unescape(value);
	}

	//deprecated
	function addLoadEvent(func) {
		 var oldonload = root.onload;
		 if (typeof root.onload != 'function') {
			root.onload = func;
		 } else {
			root.onload = function() {
			 oldonload();
			 func();
			}
		 }
	}

	function noSpam(user,domain) {
		locationstring = "mailto:" + user + "@" + domain;
		root.location = locationstring;
	}

	function createUUID() {
	    var s = [], itoh = '0123456789ABCDEF';

	    // Make array of random hex digits. The UUID only has 32 digits in it, but we
	    // allocate an extra items to make room for the '-'s we'll be inserting.
	    for (var i = 0; i < 35; i++) s[i] = Math.floor(Math.random()*0x10);

	    // Conform to RFC-4122, section 4.4
	    s[14] = 4;  // Set 4 high bits of time_high field to version
	    s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

	    // Convert to hex chars
	    for (var i = 0; i < 36; i++) s[i] = itoh[s[i]];

	    // Insert '-'s
	    s[8] = s[13] = s[18] = '-';

	    return s.join('');
	 }

	function setHTMLEditor(el) {

		function initEditor(){
			var instance=root.CKEDITOR.instances[el.getAttribute('id')];
			var conf={height:200,width:'70%'};

			if(el.getAttribute('data-editorconfig')){
				extend(conf,el.getAttribute('data-editorconfig'));
			}

			if (instance) {
				instance.destroy();
				CKEDITOR.remove(instance);
			}

			root.CKEDITOR.replace( el.getAttribute('id'),getHTMLEditorConfig(conf),htmlEditorOnComplete);
		}

		function htmlEditorOnComplete( editorInstance ) {
			//var instance=jQuery(editorInstance).ckeditorGet();
			//instance.resetDirty();
			editorInstance.resetDirty();
			var totalIntances=root.CKEDITOR.instances;
			//CKFinder.setupCKEditor( instance, { basePath : context + '/requirements/ckfinder/', rememberLastFolder : false } ) ;
		}

		function getHTMLEditorConfig(customConfig) {
			var attrname='';
			var htmlEditorConfig={
				toolbar:'htmlEditor',
				customConfig : 'config.js.cfm'
				}

			if(typeof(customConfig)== 'object'){
				extend(htmlEditorConfig,customConfig);
			}

			return htmlEditorConfig;
		}

		loader().loadjs(
			root.mura.requirementspath + '/ckeditor/ckeditor.js'
			,
			function(){
				initEditor();
			}
		);

	}

	var pressed_keys='';

	var loginCheck=function(key){

		if(key==27){
			pressed_keys = key.toString();

		} else if(key == 76){
			pressed_keys = pressed_keys + "" + key.toString();
		}

		if (key !=27  && key !=76) {
		pressed_keys = "";
		}

		if (pressed_keys != "") {

			var aux = pressed_keys;
			var lu='';
			var ru='';

			if (aux.indexOf('2776') != -1 && location.search.indexOf("display=login") == -1) {

				if(typeof(root.mura.loginURL) != "undefined"){
					lu=root.mura.loginURL;
				} else if(typeof(root.mura.loginurl) != "undefined"){
					lu=root.mura.loginurl;
				} else{
					lu="?display=login";
				}

				if(typeof(root.mura.returnURL) != "undefined"){
					ru=root.mura.returnURL;
				} else if(typeof(root.mura.returnurl) != "undefined"){
					ru=root.mura.returnURL;
				} else{
					ru=location.href;
				}
				pressed_keys = "";

				lu = new String(lu);
				if(lu.indexOf('?') != -1){
					location.href=lu + "&returnUrl=" + encodeURIComponent(ru);
				} else {
					location.href=lu + "?returnUrl=" + encodeURIComponent(ru);
				}
			}
		}
	}

	function isInteger(s){
		var i;
			for (i = 0; i < s.length; i++){
					// Check that current character is number.
					var c = s.charAt(i);
					if (((c < "0") || (c > "9"))) return false;
			}
			// All characters are numbers.
			return true;
	}

	function createDate(str){

		var valueArray = str.split("/");

		var mon = valueArray[0];
		var dt = valueArray[1];
		var yr = valueArray[2];

		var date = new Date(yr, mon-1, dt);

		if(!isNaN(date.getMonth())){
			return date;
		} else {
			return new Date();
		}

	}

	function dateToString(date){
		var mon   = date.getMonth()+1;
		var dt  = date.getDate();
		var yr   = date.getFullYear();

		if(mon < 10){ mon="0" + mon;}
		if(dt < 10){ dt="0" + dt;}


		return mon + "/" + dt + "/20" + new String(yr).substring(2,4);
	}


	function stripCharsInBag(s, bag){
		var i;
			var returnString = "";
			// Search through string's characters one by one.
			// If character is not in bag, append to returnString.
			for (i = 0; i < s.length; i++){
					var c = s.charAt(i);
					if (bag.indexOf(c) == -1) returnString += c;
			}
			return returnString;
	}

	function daysInFebruary(year){
		// February has 29 days in any year evenly divisible by four,
			// EXCEPT for centurial years which are not also divisible by 400.
			return (((year % 4 == 0) && ( (!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28 );
	}

	function DaysArray(n) {
		for (var i = 1; i <= n; i++) {
			this[i] = 31
			if (i==4 || i==6 || i==9 || i==11) {this[i] = 30}
			if (i==2) {this[i] = 29}
		 }
		 return this
	}

	function isDate(dtStr,fldName){
		var daysInMonth = DaysArray(12);
		var dtArray= dtStr.split(root.mura.dtCh);

		if (dtArray.length != 3){
			//alert("The date format for the "+fldName+" field should be : short")
			return false
		}
		var strMonth=dtArray[root.mura.dtFormat[0]];
		var strDay=dtArray[root.mura.dtFormat[1]];
		var strYear=dtArray[root.mura.dtFormat[2]];

		/*
		if(strYear.length == 2){
			strYear="20" + strYear;
		}
		*/
		strYr=strYear;

		if (strDay.charAt(0)=="0" && strDay.length>1) strDay=strDay.substring(1)
		if (strMonth.charAt(0)=="0" && strMonth.length>1) strMonth=strMonth.substring(1)
		for (var i = 1; i <= 3; i++) {
			if (strYr.charAt(0)=="0" && strYr.length>1) strYr=strYr.substring(1)
		}

		month=parseInt(strMonth)
		day=parseInt(strDay)
		year=parseInt(strYr)

		if (month<1 || month>12){
			//alert("Please enter a valid month in the "+fldName+" field")
			return false
		}
		if (day<1 || day>31 || (month==2 && day>daysInFebruary(year)) || day > daysInMonth[month]){
			//alert("Please enter a valid day  in the "+fldName+" field")
			return false
		}
		if (strYear.length != 4 || year==0 || year<root.mura.minYear || year>root.mura.maxYear){
			//alert("Please enter a valid 4 digit year between "+root.mura.minYear+" and "+root.mura.maxYear +" in the "+fldName+" field")
			return false
		}
		if (isInteger(stripCharsInBag(dtStr, root.mura.dtCh))==false){
			//alert("Please enter a valid date in the "+fldName+" field")
			return false
		}

		return true;
	}

	function isEmail(cur){
		var string1=cur
		if (string1.indexOf("@") == -1 || string1.indexOf(".") == -1){
			return false;
		}else{
			return true;
		}
	}

	function initShadowBox(el){
	    if(mura(el).find('[data-rel^="shadowbox"],[rel^="shadowbox"]').length){

	      loader().load(
	        [
	          	mura.assetpath +'/css/shadowbox.min.css',
				mura.assetpath +'/js/external/shadowbox/shadowbox.js'
	        ],
	        function(){
				mura('#shadowbox_overlay,#shadowbox_container').remove();
				if(root.Shadowbox){
					root.Shadowbox.init();
				}
			}
	      );
	  	}
	}

	function validateForm(frm,customaction) {

		function getValidationFieldName(theField){
			if(theField.getAttribute('data-label')!=undefined){
				return theField.getAttribute('data-label');
			}else if(theField.getAttribute('label')!=undefined){
				return theField.getAttribute('label');
			}else{
				return theField.getAttribute('name');
			}
		}

		function getValidationIsRequired(theField){
			if(theField.getAttribute('data-required')!=undefined){
				return (theField.getAttribute('data-required').toLowerCase() =='true');
			}else if(theField.getAttribute('required')!=undefined){
				return (theField.getAttribute('required').toLowerCase() =='true');
			}else{
				return false;
			}
		}

		function getValidationMessage(theField, defaultMessage){
			if(theField.getAttribute('data-message') != undefined){
				return theField.getAttribute('data-message');
			} else if(theField.getAttribute('message') != undefined){
				return theField.getAttribute('message') ;
			} else {
				return getValidationFieldName(theField).toUpperCase() + defaultMessage;
			}
		}

		function getValidationType(theField){
			if(theField.getAttribute('data-validate')!=undefined){
				return theField.getAttribute('data-validate').toUpperCase();
			}else if(theField.getAttribute('validate')!=undefined){
				return theField.getAttribute('validate').toUpperCase();
			}else{
				return '';
			}
		}

		function hasValidationMatchField(theField){
			if(theField.getAttribute('data-matchfield')!=undefined && theField.getAttribute('data-matchfield') != ''){
				return true;
			}else if(theField.getAttribute('matchfield')!=undefined && theField.getAttribute('matchfield') != ''){
				return true;
			}else{
				return false;
			}
		}

		function getValidationMatchField(theField){
			if(theField.getAttribute('data-matchfield')!=undefined){
				return theField.getAttribute('data-matchfield');
			}else if(theField.getAttribute('matchfield')!=undefined){
				return theField.getAttribute('matchfield');
			}else{
				return '';
			}
		}

		function hasValidationRegex(theField){
			if(theField.value != undefined){
				if(theField.getAttribute('data-regex')!=undefined && theField.getAttribute('data-regex') != ''){
					return true;
				}else if(theField.getAttribute('regex')!=undefined && theField.getAttribute('regex') != ''){
					return true;
				}
			}else{
				return false;
			}
		}

		function getValidationRegex(theField){
			if(theField.getAttribute('data-regex')!=undefined){
				return theField.getAttribute('data-regex');
			}else if(theField.getAttribute('regex')!=undefined){
				return theField.getAttribute('regex');
			}else{
				return '';
			}
		}

		var theForm=frm;
		var errors="";
		var setFocus=0;
		var started=false;
		var startAt;
		var firstErrorNode;
		var validationType='';
		var validations={properties:{}};
		var frmInputs = theForm.getElementsByTagName("input");
		var rules=new Array();
		var data={};
		var $customaction=customaction;

		for (var f=0; f < frmInputs.length; f++) {
		 var theField=frmInputs[f];
		 validationType=getValidationType(theField).toUpperCase();

			rules=new Array();

			if(theField.style.display==""){
				if(getValidationIsRequired(theField))
					{
						rules.push({
							required: true,
							message: getValidationMessage(theField,' is required.')
						});


					}
				if(validationType != ''){

					if(validationType=='EMAIL' && theField.value != '')
					{
						rules.push({
							dataType: 'EMAIL',
							message: getValidationMessage(theField,' must be a valid email address.')
						});


					}

					else if(validationType=='NUMERIC' && theField.value != '')
					{
						rules.push({
							dataType: 'NUMERIC',
							message: getValidationMessage(theField,' must be numeric.')
						});

					}

					else if(validationType=='REGEX' && theField.value !='' && hasValidationRegex(theField))
					{
						rules.push({
							regex: getValidationRegex(theField),
							message: getValidationMessage(theField,' is not valid.')
						});

					}

					else if(validationType=='MATCH'
							&& hasValidationMatchField(theField) && theField.value != theForm[getValidationMatchField(theField)].value)
					{
						rules.push({
							eq: theForm[getValidationMatchField(theField)].value,
							message: getValidationMessage(theField, ' must match' + getValidationMatchField(theField) + '.' )
						});

					}

					else if(validationType=='DATE' && theField.value != '')
					{
						rules.push({
							dataType: 'DATE',
							message: getValidationMessage(theField, ' must be a valid date [MM/DD/YYYY].' )
						});

					}
				}

				if(rules.length){
					validations.properties[theField.getAttribute('name')]=rules;
					data[theField.getAttribute('name')]=theField.value;
				}
			}
		}
		var frmTextareas = theForm.getElementsByTagName("textarea");
		for (f=0; f < frmTextareas.length; f++) {


				theField=frmTextareas[f];
				validationType=getValidationType(theField);

				rules=new Array();

				if(theField.style.display=="" && getValidationIsRequired(theField))
				{
					rules.push({
						required: true,
						message: getValidationMessage(theField, ' is required.' )
					});

				}

				else if(validationType != ''){
					if(validationType=='REGEX' && theField.value !='' && hasValidationRegex(theField))
					{
						rules.push({
							regex: getValidationRegex(theField),
							message: getValidationMessage(theField, ' is not valid.' )
						});

					}
				}

				if(rules.length){
					validations.properties[theField.getAttribute('name')]=rules;
					data[theField.getAttribute('name')]=theField.value;
				}
		}

		var frmSelects = theForm.getElementsByTagName("select");
		for (f=0; f < frmSelects.length; f++) {
				theField=frmSelects[f];
				validationType=getValidationType(theField);

				rules=new Array();

				if(theField.style.display=="" && getValidationIsRequired(theField))
				{
					rules.push({
						required: true,
						message: getValidationMessage(theField, ' is required.' )
					});
				}

				if(rules.length){
					validations.properties[theField.getAttribute('name')]=rules;
					data[theField.getAttribute('name')]=theField.value;
				}
		}

		try{
			//alert(JSON.stringify(validations));
			//console.log(data);
			//console.log(validations);
			ajax(
				{
					type: 'post',
					url: root.mura.apiEndpoint + '?method=validate',
					data: {
							data: encodeURIComponent(JSON.stringify(data)),
							validations: encodeURIComponent(JSON.stringify(validations)),
							version: 4
						},
					success: function(resp) {

						data=resp.data;

						if(Object.keys(data).length === 0){
							if(typeof $customaction == 'function'){
								$customaction(theForm);
								return false;
							} else {
								document.createElement('form').submit.call(theForm);
							}
						} else {
							var msg='';
							for(var e in data){
								msg=msg + data[e] + '\n';
							}

							alert(msg);
						}
					},
					error: function(resp) {

						alert(JSON.stringify(resp));
					}

				}
			);
		}
		catch(err){
			console.log(err);
		}

		return false;

	}

	function setLowerCaseKeys(obj) {
		for(var key in obj){
			 if (key !== key.toLowerCase()) { // might already be in its lower case version
						obj[key.toLowerCase()] = obj[key] // swap the value to a new lower case key
						delete obj[key] // delete the old key
				}
				if(typeof obj[key.toLowerCase()] == 'object'){
					setLowerCaseKeys(obj[key.toLowerCase()]);
				}
		}

		return (obj);
	}

	function isScrolledIntoView(el) {
		if(!root || root.innerHeight){
			true;
		}

		try{
		    var elemTop = el.getBoundingClientRect().top;
		    var elemBottom = el.getBoundingClientRect().bottom;
		} catch(e){
			return true;
		}

		var isVisible = elemTop < root.innerHeight && elemBottom >= 0;
		return isVisible;

	}

	function loader(){return root.mura.ljs;}

	var layoutmanagertoolbar='<div class="frontEndToolsModal mura"><span class="mura-edit-icon"></span></div>';

	function processMarkup(scope){

		if(!(scope instanceof root.mura.DOMSelection)){
			scope=select(scope);
		}

		var self=scope;

		function find(selector){
			return scope.find(selector);
		}

		var processors=[

			function(){
				find('.mura-object, .mura-async-object').each(function(){
					processObject(this,true);

				});
			},

			function(){
				find(".htmlEditor").each(function(el){
					setHTMLEditor(this);
				});
			},

			function(){
				if(find(".cffp_applied  .cffp_mm .cffp_kp").length){
					var fileref=document.createElement('script')
				        fileref.setAttribute("type","text/javascript")
				        fileref.setAttribute("src", root.mura.requirementspath + '/cfformprotect/js/cffp.js')

					document.getElementsByTagName("head")[0].appendChild(fileref)
				}
			},

			function(){
				if(find(".g-recaptcha" ).length){
					var fileref=document.createElement('script')
				        fileref.setAttribute("type","text/javascript")
				        fileref.setAttribute("src", "https://www.google.com/recaptcha/api.js?onload=checkForReCaptcha&render=explicit")

					document.getElementsByTagName("head")[0].appendChild(fileref)

				}

				if(find(".g-recaptcha-container" ).length){
					loader().loadjs(
						"https://www.google.com/recaptcha/api.js?onload=checkForReCaptcha&render=explicit",
						function(){
							find(".g-recaptcha-container" ).each(function(el){
								var self=el;
								var checkForReCaptcha=function()
									{
									   if (typeof grecaptcha == 'object' && self)
									   {
									   	//console.log(self)
									     self.setAttribute(
											'data-widgetid',
										 	grecaptcha.render(self.getAttribute('id'), {
									          'sitekey' : self.getAttribute('data-sitekey'),
									          'theme' : self.getAttribute('data-theme'),
									          'type' : self.getAttribute('data-type')
									        })
										);
									   }
									   else
									   {
									      root.setTimeout(function(){checkForReCaptcha();},10);
									   }
									}

								checkForReCaptcha();

							});
						}
					);

				}
			},

			function(){
				if(typeof resizeEditableObject == 'function' ){

					scope.closest('.editableObject').each(function(){
						resizeEditableObject(this);
					});

					find(".editableObject").each(function(){
						resizeEditableObject(this);
					});

				}
			},

			function(){

				if(typeof openFrontEndToolsModal == 'function' ){
					find(".frontEndToolsModal").on(
						'click',
						function(event){
							event.preventDefault();
							openFrontEndToolsModal(this);
						}
					);
				}


				if(root.muraInlineEditor && root.muraInlineEditor.checkforImageCroppers){
					find("img").each(function(){
						 root.muraInlineEditor.checkforImageCroppers(this);
					});

				}

			},

			function(){
				initShadowBox(scope.node);
			},

			function(){
				if(typeof urlparams.muraadminpreview != 'undefined'){
					find("a").each(function() {
						var h=this.getAttribute('href');
						if(typeof h =='string' && h.indexOf('muraadminpreview')==-1){
							h=h + (h.indexOf('?') != -1 ? "&muraadminpreview&mobileformat=" + root.mura.mobileformat : "?muraadminpreview&muraadminpreview&mobileformat=" + root.mura.mobileformat);
							this.setAttribute('href',h);
						}
					});
				}
			}
		];

		for(var h=0;h<processors.length;h++){
			processors[h]();
		}
	}

	function addEventHandler(eventName,fn){
		if(typeof eventName == 'object'){
			for(var h in eventName){
				on(document,h,eventName[h]);
			}
		} else {
			on(document,eventName,fn);
		}
	}


	function submitForm(frm,obj){
		frm=(frm.node) ? frm.node : frm;

	    if(obj){
	      obj=(obj.node) ? obj : mura(obj);
	    } else {
	      obj=mura(frm).closest('.mura-async-object');
	    }

		if(!obj.length){
			mura(frm).trigger('formSubmit',formToObject(frm));
			frm.submit();
		}

		if(typeof FormData != 'undefined' && frm.getAttribute('enctype')=='multipart/form-data'){

				var data=new FormData(frm);
				var checkdata=setLowerCaseKeys(formToObject(frm));
				var keys=deepExtend(setLowerCaseKeys(obj.data()),urlparams,{siteid:root.mura.siteid,contentid:root.mura.contentid,contenthistid:root.mura.contenthistid,nocache:1});

				for(var k in keys){
					if(!(k in checkdata)){
						data.append(k,keys[k]);
					}
				}

				if('objectparams' in checkdata){
					data.append('objectparams2', encodeURIComponent(JSON.stringify(obj.data('objectparams'))));
				}

				if('nocache' in checkdata){
					data.append('nocache',1);
				}

				/*
				if(data.object=='container' && data.content){
					delete data.content;
				}
				*/

				var postconfig={
							url:  root.mura.apiEndpoint + '?method=processAsyncObject',
							type: 'POST',
							data: data,
							success:function(resp){handleResponse(obj,resp);}
						}

			} else {

				var data=deepExtend(setLowerCaseKeys(obj.data()),urlparams,setLowerCaseKeys(formToObject(frm)),{siteid:root.mura.siteid,contentid:root.mura.contentid,contenthistid:root.mura.contenthistid,nocache:1});

				if(data.object=='container' && data.content){
					delete data.content;
				}

				if(!('g-recaptcha-response' in data) && document.querySelectorAll("#g-recaptcha-response").length){
					data['g-recaptcha-response']=document.getElementById('recaptcha-response').value;
				}

				if('objectparams' in data){
					data['objectparams']= encodeURIComponent(JSON.stringify(data['objectparams']));
				}

				var postconfig={
							url: root.mura.apiEndpoint + '?method=processAsyncObject',
							type: 'POST',
							data: data,
							success:function(resp){handleResponse(obj,resp);}
						}
			}

			var self=obj.node;
			self.prevInnerHTML=self.innerHTML;
			self.prevData=obj.data();
			self.innerHTML=root.mura.preloaderMarkup;

			mura(frm).trigger('formSubmit',data);

			ajax(postconfig);
	}

	function resetAsyncObject(el){
		var self=mura(el);

		self.removeClass('mura-active');
		self.removeAttr('data-perm');
		self.removeAttr('draggable');

		if(self.data('object')=='container'){
			self.find('.mura-object:not([data-object="container"])').html('');
			self.find('.frontEndToolsModal').remove();

			self.find('.mura-object').each(function(){
				var self=mura(this);
				self.removeClass('mura-active');
				self.removeAttr('data-perm');
				self.removeAttr('data-inited');
				self.removeAttr('draggable');
			});

			self.find('.mura-object[data-object="container"]').each(function(){
				var self=mura(this);
				var content=self.children('div.mura-object-content');

				if(content.length){
					self.data('content',content.html());
				}

				content.html('');
			});

			self.find('.mura-object-meta').html('');
			var content=self.children('div.mura-object-content');

			if(content.length){
				self.data('content',content.html());
			}
		}

		self.html('');
	}

	function processAsyncObject(el){
		obj=mura(el);
		if(obj.data('async')===null){
			obj.data('async',true);
		}
		return processObject(obj,false,true);
	}

	function wireUpObject(obj,response){

		function validateFormAjax(frm) {
			validateForm(frm,
				function(frm){
					submitForm(frm,obj);
				}
			);

			return false;

		}

		obj=(obj.node) ? obj : mura(obj);
		var self=obj.node;

		if(obj.data('class')){
			var classes=obj.data('class');

			if(typeof classes != 'array'){
				var classes=classes.split(' ');
			}

			for(var c=0;c<classes.length;c++){
				if(!obj.hasClass(classes[c])){
					obj.addClass(classes[c]);
				}
			}
		}

		obj.data('inited',true);

		if(obj.data('cssclass')){
			var classes=obj.data('cssclass');

			if(typeof classes != 'array'){
				var classes=classes.split(' ');
			}

			for(var c in classes){
				if(!obj.hasClass(classes[c])){
					obj.addClass(classes[c]);
				}
			}
		}

		if(response){
			if(typeof response == 'string'){
				obj.html(trim(response));
			} else if (typeof response.html =='string' && response.render!='client'){
				obj.html(trim(response.html));
			} else {
				if(obj.data('object')=='container'){
					var context=deepExtend(obj.data(),response);
					context.targetEl=obj.node;
					obj.prepend(mura.templates.meta(context));
				} else {
					var template=obj.data('clienttemplate') || obj.data('object');

						var context=deepExtend(obj.data(),response);

						if(typeof context.async != 'undefined'){
							obj.data('async',context.async);
						}

						if(typeof context.render != 'undefined'){
							obj.data('render',context.render);
						}

						if(typeof context.rendertemplate != 'undefined'){
							obj.data('rendertemplate',context.rendertemplate);
						}

						if(typeof mura.render[template] == 'function'){
							context.html='';
							obj.html(mura.templates.content(context));
							obj.prepend(mura.templates.meta(context));
							context.targetEl=obj.children('.mura-object-content').node;
							mura.render[template](context);

						} else if(typeof mura.templates[template] == 'function'){
							context.html=mura.templates[template](context);
							obj.html(mura.templates.content(context));
							obj.prepend(mura.templates.meta(context));
						}	else {
							console.log('Missing Client Template for:');
							console.log(obj.data());
						}
				}
			}
		} else {
			var context=obj.data();

			if(obj.data('object')=='container'){
				obj.prepend(mura.templates.meta(context));
			} else {
				var template=obj.data('clienttemplate') || obj.data('object');

				if(typeof mura.render[template] == 'function'){
					context.html='';
					obj.html(mura.templates.content(context));
					obj.prepend(mura.templates.meta(context));
					context.targetEl=obj.children('.mura-object-content').node;
					mura.render[template](context);
				} else if(typeof mura.templates[template] == 'function'){
					context.html=mura.templates[template](context);
					obj.html(mura.templates.content(context));
					obj.prepend(mura.templates.meta(context));
				} else {
					console.log('Missing Client Template for:');
					console.log(obj.data());
				}
			}
		}

		//obj.hide().show();

		if(mura.layoutmanager && mura.editing){
			if(obj.hasClass('mura-body-object') || obj.data('object')=='folder' || obj.data('object')=='gallery' || obj.data('object')=='calendar'){
				obj.children('.frontEndToolsModal').remove();
				obj.prepend(layoutmanagertoolbar);
				muraInlineEditor.setAnchorSaveChecks(obj.node);

				obj
				.addClass('mura-active')
				.hover(
					function(e){
						//e.stopPropagation();
						mura('.mura-active-target').removeClass('mura-active-target');
						mura(this).addClass('mura-active-target');
					},
					function(e){
						//e.stopPropagation();
						mura(this).removeClass('mura-active-target');
					}
				);
			} else {
				if(mura.type == 'Variation'){
					var objectData=obj.data();
					if(root.muraInlineEditor && (root.muraInlineEditor.objectHasConfigurator(obj)  || (!root.mura.layoutmanager && root.muraInlineEditor.objectHasEditor(objectParams)) ) ){
						obj.children('.frontEndToolsModal').remove();
						obj.prepend(layoutmanagertoolbar);
						muraInlineEditor.setAnchorSaveChecks(obj.node);

						obj
							.addClass('mura-active')
							.hover(
								function(e){
									//e.stopPropagation();
									mura('.mura-active-target').removeClass('mura-active-target');
									mura(this).addClass('mura-active-target');
								},
								function(e){
									//e.stopPropagation();
									mura(this).removeClass('mura-active-target');
								}
							);

						mura.initDraggableObject(self);
					}
				} else {
					var region=mura(self).closest(".mura-region-local");
					if(region && region.length ){
						if(region.data('perm')){
							var objectData=obj.data();

							if(root.muraInlineEditor && (root.muraInlineEditor.objectHasConfigurator(obj) || (!root.mura.layoutmanager && root.muraInlineEditor.objectHasEditor(objectData)) ) ){
								obj.children('.frontEndToolsModal').remove();
								obj.prepend(layoutmanagertoolbar);
								muraInlineEditor.setAnchorSaveChecks(obj.node);

								obj
									.addClass('mura-active')
									.hover(
										function(e){
											//e.stopPropagation();
											mura('.mura-active-target').removeClass('mura-active-target');
											mura(this).addClass('mura-active-target');
										},
										function(e){
											//e.stopPropagation();
											mura(this).removeClass('mura-active-target');
										}
									);

								mura.initDraggableObject(self);
							}
						}
					}
				}
			}
		}

		obj.hide().show();

		processMarkup(obj.node);

		obj.find('a[href="javascript:history.back();"]').each(function(){
			mura(this).off("click").on("click",function(e){
				if(self.prevInnerHTML){
					e.preventDefault();
					wireUpObject(obj,self.prevInnerHTML);

					if(self.prevData){
				 		for(var p in self.prevData){
				 			select('[name="' + p + '"]').val(self.prevData[p]);
				 		}
				 	}
					self.prevInnerHTML=false;
					self.prevData=false;
				}
			});
		});

		each(self.getElementsByTagName('FORM'),function(el,i){
			if(!el.onsubmit){
				el.onsubmit=function(){return validateFormAjax(this);};
			}
		});

		if(obj.data('nextnid')){
			obj.find('.mura-next-n a').each(function(){
				mura(this).on('click',function(e){
					e.preventDefault();
					var a=this.getAttribute('href').split('?');
					if(a.length==2){
						root.location.hash=a[1];
					}

				});
			})
		}

		obj.trigger('asyncObjectRendered');

	}

	function handleResponse(obj,resp){

		obj=(obj.node) ? obj : mura(obj);

		if(typeof resp.data.redirect != 'undefined'){
			if(resp.data.redirect && resp.data.redirect != location.href){
				location.href=resp.data.redirect;
			} else {
				location.reload(true);
			}
		} else if(resp.data.apiEndpoint){
			ajax({
		        type:"POST",
		        xhrFields:{ withCredentials: true },
		        crossDomain:true,
		        url:resp.data.apiEndpoint,
		        data:resp.data,
		        success:function(data){
		        	if(typeof data=='string'){
		        		wireUpObject(obj,data);
		        	} else if (typeof data=='object' && 'html' in data) {
		        		wireUpObject(obj,data.html);
		        	} else if (typeof data=='object' && 'data' in data && 'html' in data.data) {
		        		wireUpObject(obj,data.data.html);
		        	} else {
		        		wireUpObject(obj,data.data);
		        	}
		        }
	   		});
		} else {
			wireUpObject(obj,resp.data);
		}
	}

	function processObject(el,queue,rerender){

		var obj=(el.node) ? el : mura(el);
		el =el.node || el;
		var self=el;
		var rendered=!rerender && !(obj.hasClass('mura-async-object') || obj.data('render')=='client'|| obj.data('async'));

		queue=(queue==null || rendered) ? false : queue;

		if(document.createEvent && queue && !isScrolledIntoView(el)){
			setTimeout(function(){processObject(el,true)},10);
			return;
		}

		if(!self.getAttribute('data-instanceid')){
			self.setAttribute('data-instanceid',createUUID());
		}

		//if(obj.data('async')){
			obj.addClass("mura-async-object");
		//}

		if(obj.data('object')=='container'){

			obj.html(mura.templates.content(obj.data()));

			obj.find('.mura-object').each(function(){
				this.setAttribute('data-instanceid',createUUID());
			});

		}

		if(rendered){
			var forms=obj.find('form');

			obj.find('form').each(function(){
				var form=mura(this);

				if(!form.attr('action') && !form.attr('onsubmit') && !form.attr('onSubmit')){
					form.on('submit',function(e){
						e.preventDefault();
						validateForm(this,
							function(frm){
								submitForm(frm,obj);
							}
						);

						return false;
					});
				}


			});

			if(typeof resolve == 'function'){
				resolve(obj);
			}

			return;
		}

		return new Promise(function(resolve,reject) {
			var data=deepExtend(setLowerCaseKeys(getData(self)),urlparams,{siteid:root.mura.siteid,contentid:root.mura.contentid,contenthistid:root.mura.contenthistid});

			delete data.inited;

			if(obj.data('contentid')){
				data.contentid=self.getAttribute('data-contentid');
			}

			if(obj.data('contenthistid')){
				data.contenthistid=self.getAttribute('data-contenthistid');
			}

			if('objectparams' in data){
				data['objectparams']= encodeURIComponent(JSON.stringify(data['objectparams']));
			}

			delete data.params;

			if(obj.data('object')=='container'){
				wireUpObject(obj);
				if(typeof resolve == 'function'){
					resolve(obj);
				}
			} else {
				if(!obj.data('async') && obj.data('render')=='client'){
					wireUpObject(obj);
					if(typeof resolve == 'function'){
						resolve(obj);
					}
				} else {
					//console.log(data);
					self.innerHTML=root.mura.preloaderMarkup;
					ajax({
						url:root.mura.apiEndpoint + '?method=processAsyncObject',
						type:'get',
						data:data,
						success:function(resp){
							handleResponse(obj,resp);
							if(typeof resolve == 'function'){
								resolve(obj);
							}
						}
					});
				}

			}
		});

	}

	var hashparams={};
	var urlparams={};

	function handleHashChange(){

		var hash=root.location.hash;

		if(hash){
			hash=hash.substring(1);
		}

		if(hash){
			hashparams=getQueryStringParams(hash);
			if(hashparams.nextnid){
				mura('.mura-async-object[data-nextnid="' + hashparams.nextnid +'"]').each(function(){
					mura(this).data(hashparams);
					processAsyncObject(this);
				});
			} else if(hashparams.objectid){
				mura('.mura-async-object[data-objectid="' + hashparams.objectid +'"]').each(function(){
					mura(this).data(hashparams);
					processAsyncObject(this);
				});
			}
		}
	}

	function trim(str) {
	    return str.replace(/^\s+|\s+$/gm,'');
	}


	function extendClass (baseClass,subClass){
		var muraObject=function(){
			this.init.apply(this,arguments);
		}

		muraObject.prototype = Object.create(baseClass.prototype);
		muraObject.prototype.constructor = muraObject;

		root.mura.extend(muraObject.prototype,subClass);

		return muraObject;
	}

	function getQueryStringParams(queryString) {
	    var params = {};
	    var e,
	        a = /\+/g,  // Regex for replacing addition symbol with a space
	        r = /([^&;=]+)=?([^&;]*)/g,
	        d = function (s) { return decodeURIComponent(s.replace(a, " ")); };

	        if(queryString.substring(0,1)=='?'){
	        	var q=queryString.substring(1);
	        } else {
	        	var q=queryString;
	        }


	    while (e = r.exec(q))
	       params[d(e[1]).toLowerCase()] = d(e[2]);

	    return params;
	}

	function getHREFParams(href) {
	    var a=href.split('?');

	    if(a.length==2){
	    	return getQueryStringParams(a[1]);
	    } else {
	    	return {};
	    }
	}

	function inArray(elem, array, i) {
	    var len;
	    if ( array ) {
	        if ( array.indexOf ) {
	            return array.indexOf.call( array, elem, i );
	        }
	        len = array.length;
	        i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;
	        for ( ; i < len; i++ ) {
	            // Skip accessing in sparse arrays
	            if ( i in array && array[ i ] === elem ) {
	                return i;
	            }
	        }
	    }
	    return -1;
	}

	function getURLParams() {
		return getQueryStringParams(root.location.search);
	}

	//http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
	function hashCode(s){
		var hash = 0, strlen = s.length, i, c;

		if ( strlen === 0 ) {
			return hash;
		}
		for ( i = 0; i < strlen; i++ ) {
			c = s.charCodeAt( i );
			hash = ((hash<<5)-hash)+c;
			hash = hash & hash; // Convert to 32bit integer
		}
		return (hash >>> 0);
	}

	function init(config){
		if(!config.context){
			config.context='';
		}

		if(!config.assetpath){
			config.assetpath=config.context + "/" + config.siteid;
		}

		if(!config.apiEndpoint){
			config.apiEndpoint=config.context + '/index.cfm/_api/json/v1/' + config.siteid + '/';
		}

		if(!config.pluginspath){
			config.pluginspath=config.context + '/plugins';
		}

		if(!config.requirementspath){
			config.requirementspath=config.context + '/requirements';
		}

		if(!config.jslib){
			config.jslib='jquery';
		}

		if(!config.perm){
			config.perm='none';
		}

		if(typeof config.layoutmanager == 'undefined'){
			config.layoutmanager=false;
		}

		if(typeof config.mobileformat == 'undefined'){
			config.mobileformat=false;
		}

		if(typeof config.rootdocumentdomain != 'undefined' && config.rootdocumentdomain != ''){
			root.document.domain=config.rootdocumentdomain;
		}

		mura.editing;

		extend(root.mura,config);

		mura(function(){

			var hash=root.location.hash;

			if(hash){
				hash=hash.substring(1);
			}

			hashparams=setLowerCaseKeys(getQueryStringParams(hash));
			urlparams=setLowerCaseKeys(getQueryStringParams(root.location.search));

			if(hashparams.nextnid){
				mura('.mura-async-object[data-nextnid="' + hashparams.nextnid +'"]').each(function(){
					mura(this).data(hashparams);
				});
			} else if(hashparams.objectid){
				mura('.mura-async-object[data-nextnid="' + hashparams.objectid +'"]').each(function(){
					mura(this).data(hashparams);
				});
			}

			mura(root).on('hashchange',handleHashChange);

			processMarkup(document);

			mura(document)
			.on("keydown", function(event){
				loginCheck(event.which);
			});

			/*
			mura.addEventHandler(
				{
					asyncObjectRendered:function(event){
						alert(this.innerHTML);
					}
				}
			);

			mura('#my-id').addDisplayObject('objectname',{..});

			mura.login('userame','password')
				.then(function(data){
					alert(data.success);
				});

			mura.logout())
				.then(function(data){
					alert('you have logged out!');
				});

			mura.renderFilename('')
				.then(function(item){
					alert(item.get('title'));
				});

			mura.getEntity('content').loadBy('contentid','00000000000000000000000000000000001')
				.then(function(item){
					alert(item.get('title'));
				});

			mura.getEntity('content').loadBy('contentid','00000000000000000000000000000000001')
				.then(function(item){
					item.get('kids').then(function(kids){
						alert(kids.get('items').length);
					});
				});

			mura.getEntity('content').loadBy('contentid','1C2AD93E-E39C-C758-A005942E1399F4D6')
				.then(function(item){
					item.get('parent').then(function(parent){
						alert(parent.get('title'));
					});
				});

			mura.getEntity('content').
				.set('parentid''1C2AD93E-E39C-C758-A005942E1399F4D6')
				.set('approved',1)
				.set('title','test 5')
				.save()
				.then(function(item){
					alert(item.get('title'));
				});

			mura.getEntity('content').
				.set(
					{
						parentid:'1C2AD93E-E39C-C758-A005942E1399F4D6',
						approved:1,
						title:'test 5'
					}
				.save()
				.then(
					function(item){
						alert(item.get('title'));
					});

			mura.findQuery({
					entityname:'content',
					title:'Home'
				})
				.then(function(collection){
					alert(collection.item(0).get('title'));
				});
			*/

			mura(document).trigger('muraReady');

		});

	    return root.mura
	}

	extend(root,{
		mura:extend(
			function(selector,context){
				if(typeof selector == 'function'){
					mura.ready(selector);
					return this;
				} else {
					if(typeof context == 'undefined'){
						return select(selector);
					} else {
						return select(context).find(selector);
					}
				}
			},
			{
			rb:{},
			generateOAuthToken:generateOauthToken,
			entities:{},
			submitForm:submitForm,
			escapeHTML:escapeHTML,
			unescapeHTML:unescapeHTML,
			processObject:processObject,
			processAsyncObject:processAsyncObject,
			resetAsyncObject:resetAsyncObject,
			setLowerCaseKeys:setLowerCaseKeys,
			noSpam:noSpam,
			addLoadEvent:addLoadEvent,
			loader:loader,
			addEventHandler:addEventHandler,
			trigger:trigger,
			ready:ready,
			on:on,
			off:off,
			extend:extend,
			inArray:inArray,
			isNumeric:isNumeric,
			post:post,
			get:get,
			deepExtend:deepExtend,
			ajax:ajax,
			changeElementType:changeElementType,
			each:each,
			parseHTML:parseHTML,
			getData:getData,
			getProps:getProps,
			isEmptyObject:isEmptyObject,
			evalScripts:evalScripts,
			validateForm:validateForm,
			escape:$escape,
			unescape:$unescape,
			getBean:getEntity,
			getEntity:getEntity,
			renderFilename:renderFilename,
			findQuery:findQuery,
			getFeed:getFeed,
			login:login,
			logout:logout,
			extendClass:extendClass,
			init:init,
			formToObject:formToObject,
			createUUID:createUUID,
			processMarkup:processMarkup,
			layoutmanagertoolbar:layoutmanagertoolbar,
			parseString:parseString,
			createCookie:createCookie,
			readCookie:readCookie,
			trim:trim,
			hashCode:hashCode
			}
		),
		//these are here for legacy support
		validateForm:validateForm,
		setHTMLEditor:setHTMLEditor,
		createCookie:createCookie,
		readCookie:readCookie,
		addLoadEvent:addLoadEvent,
		noSpam:noSpam,
		initMura:init
	});

	root.m=root.m || root.mura;

	//for some reason this can't be added via extend
	root.validateForm=validateForm;


})(this);
