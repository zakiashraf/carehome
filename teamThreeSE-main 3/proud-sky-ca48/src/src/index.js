export default {
    async fetch(request, env) {
        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
            return handleOptions(request);
        }

        // Process the actual request and apply CORS to the response
        let response;
        const { pathname } = new URL(request.url);

        // check we have the right authorisation
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !==
            'Bearer 3673e336-cad2-439b-8581-eb9e3045fc94'
        ) {
            return new Response('Unauthorized', { status: 401 });
        }





        if (pathname === '/api/getDevices') {
            const requestBody = await request.json();
            var userId = requestBody.userId;
            const results = await env.DATABASE.prepare('SELECT * FROM devices WHERE owner_id = ?').bind(userId).all();

            if (!results) {
                response = new Response('Not Found', { status: 404 });
            } else {
                response = new Response(JSON.stringify(results), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        else if (pathname === '/api/updateDevices') {
            const results = await env.DATABASE.prepare('SELECT * FROM devices').all();

            if (!results) {
                response = new Response('Not Found', { status: 404 });
            } else {

                const devices = results.results;
                var out = false;
                for (let index = 0; index < devices.length; index++) {
                    const device = devices[index];
                    if (device.type != 'radiator') {
                        if (device.state = 'on') {
                            var devData = JSON.parse(device.data);
                            var usageData = devData.usageData;
                            var currentTime = new Date(Date.now());
                            var lastUpdate = new Date(devData.lastUpdate);
                            var timeSince = (currentTime.getTime() - lastUpdate.getTime());
                            if (!((lastUpdate.getHours() == currentTime.getHours()) && (lastUpdate.getDate() == currentTime.getDate()))) {
                                for (let index = 0; index < Math.trunc(timeSince / (1000 * 60 * 60)); index++) {
                                    usageData.shift();
                                    if ((index + 1) < Math.trunc(timeSince / (1000 * 60 * 60))) {
                                        usageData.push(device.power_usage);
                                    }
                                }

                                usageData.push(0);
                                console.log(usageData);
                            }
                            if (timeSince > 60000) {
                                const remainingTime = ((timeSince % (60 * 60 * 1000)) / 60000);
                                usageData[usageData.length - 1] = Math.round((usageData[usageData.length - 1] + ((device.power_usage / 60) * remainingTime)) * 100) / 100;
                                while (usageData.length > 8760) {
                                    usageData.shift();
                                }
                                devData.usageData = usageData;
                                devData.lastUpdate = Date.now();

                                const updateResult = await env.DATABASE.prepare('UPDATE devices SET data = ? WHERE device_id = ?')
                                    .bind(JSON.stringify(devData), device.device_id)
                                    .all();

                                out = true;
                            }
                        }
                    }
                }
                response = new Response(JSON.stringify(out), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        else if (pathname === '/api/updateGroup') {
            const responseBody = await request.json();
            var newGroups = responseBody.groups; //assume is a string
            var deviceId = responseBody.deviceId;

            const result = await env.DATABASE.prepare('UPDATE devices SET `group` = ? WHERE device_id = ?')
                .bind(newGroups, deviceId)
                .all();

            if (result.success) {
                response = new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            else {
                response = new Response('Not Found', { status: 400 });

            }
        }



        else if (pathname === '/api/testAutomation') {
            //await doAutomations(env);
            response = new Response('Automations done', { status: 200 });
        } else if (pathname === '/api/addDeviceAutomation') {
            const requestBody = await request.json();
            var automationIn = requestBody.automation;
            var deviceId = requestBody.deviceId;
            const deviceData = await env.DATABASE.prepare('SELECT data FROM devices WHERE device_id = ?').bind(deviceId).all();
            var deviceDataOutput = deviceData.results[0].data;
            console.log(deviceDataOutput);
            // if(deviceDataOutput == null){
            // 	console.log('null - here');
            // 	deviceDataOutput = '{"automations": [], "usageData":[]}';
            // }
            if (deviceDataOutput) {
                var realData = JSON.parse(deviceDataOutput);
                if (!realData.automations) {
                    realData.automations = [];
                }
                realData.automations.push(automationIn);
                const result = await env.DATABASE.prepare('UPDATE devices SET data = ? WHERE device_id = ?')
                    .bind(JSON.stringify(realData), deviceId)
                    .all();

                if (result.success) {
                    response = new Response(JSON.stringify({ success: true }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            } else {
                response = new Response('Not Found', { status: 400 });
            }
        } else if (pathname === '/api/deleteDeviceAutomation') {
            const requestBody = await request.json();
            var indexToDelete = requestBody.indexToDelete;
            var deviceId = requestBody.deviceId;
            const deviceData = await env.DATABASE.prepare('SELECT data FROM devices WHERE device_id = ?').bind(deviceId).all();
            var deviceDataOutput = deviceData.results[0].data;
            console.log(deviceDataOutput);
            // if(deviceDataOutput == null){
            // 	console.log('null - here');
            // 	deviceDataOutput = '{"automations": [], "usageData":[]}';
            // }
            if (deviceDataOutput) {
                var realData = JSON.parse(deviceDataOutput);
                if (!realData.automations) {
                    realData.automations = [];
                }
                var copyAutomations = realData.automations;
                copyAutomations.splice(indexToDelete, 1);
                realData.automations = copyAutomations;

                console.log(realData.automations);
                const result = await env.DATABASE.prepare('UPDATE devices SET data = ? WHERE device_id = ?')
                    .bind(JSON.stringify(realData), deviceId)
                    .all();

                if (result.success) {
                    response = new Response(JSON.stringify({ success: true }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            } else {
                response = new Response('Not Found', { status: 400 });
            }
        } else if (pathname === '/api/deleteDevice') {
            const requestBody = await request.json();
            var deviceId = requestBody.deviceId;
            const result = await env.DATABASE.prepare('DELETE FROM devices WHERE device_id = ?').bind(deviceId).all();

            if (result.success) {
                response = new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                response = new Response('Not Found', { status: 400 });
            }
        } else if (pathname == '/api/addDevice') {
            console.log('yup');
            const requestBody = await request.json();
            var deviceName = requestBody.deviceName; //modify
            var deviceType = requestBody.deviceType;
            var devicePowerUsage = 1;
            var deviceState = requestBody.deviceType == 'radiator' ? '20' : 'off';
            var generatedData = generateData(deviceType.toLowerCase());
            var deviceData = JSON.stringify({ automations: [], lastUpdate: Date.now(), usageData: generatedData });
            var userID = requestBody.userID;
            var groups = JSON.stringify([]);

            var id = generateUUID();
            //var ownId = generateUUID();
            //var deviceState = 'off'; // modify

            console.log(deviceName, deviceType, id, deviceState, devicePowerUsage, userID);

            if (deviceName && deviceType && id && deviceState && devicePowerUsage && userID) {
                console.log('here');
                const result = await env.DATABASE.prepare(
                    'INSERT INTO devices (device_id, Name, type, power_usage, state, owner_id , data, `group` ) VALUES (?, ?, ?, ?, ?, ?, ?, ? )' //modify
                )
                    .bind(id, deviceName, deviceType, devicePowerUsage, deviceState, userID, deviceData, groups)
                    .run();
                if (result.success) {
                    response = new Response(JSON.stringify({ success: true }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    });
                } else {
                    response = new Response('Not Found', { status: 400 });
                }
            } else {
                console.log('its over :(');
                // Add this line to return a proper error response:
                response = new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        } else if (pathname === '/api/updateDeviceState') {
            const requestBody = await request.json();
            var id = requestBody.id;
            var newState = requestBody.newState;

            if (id && newState) {
                const result = await env.DATABASE.prepare('UPDATE devices SET state = ? WHERE device_id = ?').bind(newState, id).run();
                if (result.success) {
                    response = new Response(JSON.stringify({ success: true }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    });
                } else {
                    response = new Response('Not Found', { status: 400 });
                }
            }
        } else if (pathname === '/api/getUsers') {
            console.log('Fetching users'); // WHERE user_type = 'resident'
            const { results } = await env.DATABASE.prepare('SELECT user_id, username, user_type, location FROM users').all();
            response = new Response(JSON.stringify(results), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else if (pathname === '/api/getManagerUsers') {
            const requestBody = await request.json();
            var location = requestBody.location;
            const results = await env.DATABASE.prepare('SELECT user_id, username, user_type, location FROM users WHERE location = ?')
                .bind(location)
                .all();
            response = new Response(JSON.stringify(results), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });




        }

        else if (pathname === '/api/getDevicesAtLocation') {
            console.log('Fetching devices');

            const requestBody = await request.json();
            var location = requestBody.location;
            console.log(location);
            //we need to get all the user ids at the location and then get all the devices for each user
            const { results } = await env.DATABASE.prepare('SELECT * FROM devices WHERE owner_id IN (SELECT user_id FROM users WHERE location = ?)').bind(location).all();
            console.log(results);
            var allDevices = [];

            response = new Response(JSON.stringify(results), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        else if (pathname == '/api/updateMessage') {
            const requestBody = await request.json();
            var message = requestBody.message;
            var userId = requestBody.userId;
            console.log('message:', message);
            console.log('userId:', userId);
            const result = await env.DATABASE.prepare('UPDATE users SET message = ? WHERE user_id = ?').bind(message, userId).all();
            console.log(result);
            if (result.success) {
                response = new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                response = new Response('Not Found', { status: 400 });
            }
        }

        else if (pathname == '/api/getMessage') {
            const requestBody = await request.json();
            var userId = requestBody.userId;
            console.log('userId:', userId);
            const result = await env.DATABASE.prepare('SELECT message FROM users WHERE user_id = ?').bind(userId).all();
            console.log(result);
            if (result.success) {
                response = new Response(JSON.stringify({ message: result.results[0].message }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                response = new Response('Not Found', { status: 400 });
            }
        }



        else if (pathname === '/api/updateUser') {
            const requestBody = await request.json();
            var userId = requestBody.userId;
            var username = requestBody.username;
            var password = requestBody.password;
            var newLocation = requestBody.location;

            const result = await env.DATABASE.prepare('UPDATE users SET username = ?, password = ?, location = ? WHERE user_id = ?')
                .bind(username, password, newLocation, userId)
                .all();

            if (result.success) {
                response = new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                response = new Response('Not Found', { status: 400 });
            }
        } else if (pathname === '/api/deleteUser') {
            const requestBody = await request.json();
            var userId = requestBody.userId;

            const result = await env.DATABASE.prepare('DELETE FROM users WHERE user_id = ?').bind(userId).all();

            if (result.success) {
                response = new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                response = new Response('Not Found', { status: 400 });
            }
        } else if (pathname === '/api/addUser') {
            const requestBody = await request.json();
            var username = requestBody.username;
            var password = requestBody.password;
            var userType = requestBody.userType;
            var userLocation = requestBody.userLocation;

            var userId = generateUUID();

            const result = await env.DATABASE.prepare(
                'INSERT INTO users (user_id, username, password, user_type, location) VALUES (?, ?, ?, ?, ?)'
            )
                .bind(userId, username, password, userType, userLocation)
                .run();

            if (result.success) {
                response = new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                response = new Response('Not Found', { status: 400 });
            }
        } else if (pathname === '/api/getdevice_user') {
            console.log('Fetching users');
            const { results } = await env.DATABASE.prepare('SELECT user_id, device_id FROM device_user ').all();
            response = new Response(JSON.stringify(results), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        //log in user
        else if (pathname == '/api/login') {
            const requestBody = await request.json();
            var userNameIn = requestBody.username;
            var passwordIn = requestBody.password;

            console.log(userNameIn, passwordIn);

            if (userNameIn && passwordIn) {
                console.log('here');
                const result = await env.DATABASE.prepare('SELECT * FROM users WHERE username = ?').bind(userNameIn).run();
                //log the password and check it against the password in the database
                console.log(result);
                if (result.results) {
                    console.log(result.results);
                    console.log(result.results[0].password);
                    console.log(result.results[0].password == passwordIn);
                }

                if (!result.results) {
                    response = new Response('Not Found', { status: 400 });
                } else if (result.results[0].password == passwordIn) {
                    console.log('success');
                    response = new Response(
                        JSON.stringify({
                            user_id: result.results[0].user_id,
                            username: result.results[0].username,
                            user_type: result.results[0].user_type,
                            location: result.results[0].location,
                        }),
                        {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' },
                        }
                    );
                } else {
                    response = new Response('Not Found', { status: 400 });
                }
            } else {
                console.log('its over :(');
                // Add this line to return a proper error response:
                response = new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        } else if (pathname === '/api/getWeatherData') {
            const data = await env.workerPersistantVars.get('weatherData');
            response = new Response(data, {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Apply CORS headers to the response
        return corsify(response || new Response('Not Found', { status: 404 }));
    },

    async scheduled(event, env, ctx) {
        if (typeof ctr == 'undefined') {
            let ctr = 0;
        }
        updateData(ctr);
        const data = await fetchWeatherData();
        await doAutomations(env);
        await env.workerPersistantVars.put('weatherData', JSON.stringify(data));
    },
};



// This function adds CORS headers to any response
function corsify(response) {
    // Clone the response so we can modify headers
    const corsResponse = new Response(response.body, response);

    // Add CORS headers to the new response
    corsResponse.headers.set('Access-Control-Allow-Origin', '*');
    corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return corsResponse;
}

// Handle CORS preflight requests
function handleOptions(request) {
    // Make sure the necessary headers are present
    // for the browser to actually make the request
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    };

    return new Response(null, {
        status: 204,
        headers,
    });
}

function updateData(counter) {
    const devices = getDevices();
    for (let index = 0; index < devices.length; index++) {
        const device = JSON.parse(devices[index]);
        const devData = device.data;
        if (counter % 12 == 0) {
            devData.shift();
            devData.push(0);
        }
        const oldVal = devData[(devData.length - 1)];
        const usage = Math.round((device.power_usage / 12) * 10) / 10;
        const newVal = oldVal + usage;
        devData[(devData.length - 1)] = newVal;
        console.log(device.name, oldVal, newVal)
    }
}

//this generated an ID which will never be the same again
function generateUUID() {
    return crypto.randomUUID();
}

async function fetchWeatherData() {
    try {
        const apiKey = 'nBJht9TvrpZsBKrZAiaBw4Jwn5gSesxM';
        const location = 'edinburgh';
        const url = `https://api.tomorrow.io/v4/weather/realtime?location=${location}&apikey=${apiKey}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        //console.log('Weather data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

function generateData(deviceType) {
    var newArray = [];

    switch (deviceType) {
        case 'radiator':
            for (let index = 0; index < 8760; index++) {
                var myRandom = parseFloat((Math.random() * (1.8 - 1.3) + 1.3).toFixed(2));
                newArray.push(myRandom);
            }
            break;

        case 'light':
            for (let index = 0; index < 8760; index++) {
                var myRandom = parseFloat((Math.random() * (1.2 - 0.9) + 0.9).toFixed(2));
                newArray.push(myRandom);
            }
            break;

        case 'plug':
            for (let index = 0; index < 8760; index++) {
                var myRandom = parseFloat((Math.random() * (1 - 0.5) + 0.5).toFixed(2));
                newArray.push(myRandom);
            }
            break;

        case 'blind':
            for (let index = 0; index < 8760; index++) {
                var myRandom = parseFloat((Math.random() * (0.9 - 0.5) + 0.5).toFixed(2));
                newArray.push(myRandom);
            }
            break;

        default:
            for (let index = 0; index < 8760; index++) {
                var myRandom = parseFloat((Math.random() * (1.8 - 0.9) + 0.9).toFixed(2));
                newArray.push(myRandom);
            }
            break;
    }

    return newArray;
}

function runAutomations(envIn, newAutomationsIn, idsIn) {
    //var currentWeather = "sunny";
    var currentTemp = 90;

    //we need to get the current weather, time, temperature and day
    envIn.workerPersistantVars.get('weatherData').then((weatherData) => {
        console.log('weatherData:', weatherData);
        if (weatherData) {
            const data = JSON.parse(weatherData);
            console.log('data:', data);
            const currentWeather = data.weather.code;
            const currentTemp = data.temperature.value;
        }
    });

    var currentTime = new Date();
    var dayOfWeek = currentTime.getDay();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var currentDay = days[dayOfWeek];

    console.log('pending automations:', newAutomationsIn.length);

    var ids = [];
    //   var currentId = idsIn[i];
    console.log('current automation:', currentAutomation);
    var completedAuto = false;
    for (var i = 0; i < newAutomationsIn.length; i++) {
        var currentAutomation = newAutomationsIn[i];
        var completedAuto = false;

        switch (currentAutomation.triggerType.toLowerCase()) {
            case 'weather':
                console.log('weather automation');
                completedAuto = conditionValid(currentWeather, currentAutomation.triggerCondition, currentAutomation.triggerValue);
                break;

            case 'time':
                console.log('time automation');
                completedAuto = checkTime(currentAutomation.triggerValue);
                break;

            case 'temperature':
                console.log('temperature automation');
                completedAuto = conditionValid(currentTemp, currentAutomation.triggerCondition, currentAutomation.triggerValue);
                break;

            case 'day':
                console.log('day automation');
                completedAuto = conditionValid(currentDay, currentAutomation.triggerCondition, currentAutomation.triggerValue);
                break;
        }
    }

    if (completedAuto) {
        console.log('automation completed');
        //send the update to the device
        envIn.DATABASE.prepare('UPDATE devices SET state = ? WHERE device_id = ?')
            .bind(currentAutomation.actionValue, currentAutomation.deviceId)
            .run();
    }

    console.log('remaining autos: ' + autoToReRun.length);
    console.log('remaining autos: ' + autoToReRun.length);
}

function conditionValid(current, condition, value) {
    switch (condition.toLowerCase()) {
        case 'above':
            return current > value;
        case 'below':
            return current < value;
        case 'equal':
            return current == value;
    }
}

function checkTime(timeIn) {
    //we only run this every 5 mins, check if the time in is within 5 mins of the current time
    var currentTime = new Date();
    var timeDiff = currentTime - timeIn;
    if (timeDiff < 300000) {
        return true;
    }
    return false;
}

//  async function doAutomations(envIn){
// 	//get ALL devices

// 	console.log('doing automations');
// 	//do a query to get all devices
// 	const results = await envIn.DATABASE.prepare('SELECT * FROM devices').all();
// 	console.log('database Q done')
// 	console.log('results:', results.results.length);
// 	var devices = results.results;
// 	var currentAutomations = [];
// 	var currentId = [];

// 		for(var i = 0; i < devices.length; i++){
// 			var currentDevice = devices[i];
// 			var currentData = JSON.parse(currentDevice.data);
// 			var currentAutomations = currentData.automations;
// 			for(var j = 0; j < currentAutomations.length; j++){
// 				currentId.push(currentDevice.device_id);
// 				currentAutomations.push(currentAutomations[j]);
// 			}
// 			console.log('current automations:', currentAutomations.length);
// 		}

// 		console.log('final automations:', currentAutomations.length);

// 	runAutomations(envIn, currentAutomations, currentId);
// 	// }
// 	// catch(e){
// 	// 	console.log('error:', e);
// 	// }
//   }
