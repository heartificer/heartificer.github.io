document.addEventListener("DOMContentLoaded", function(event) { /* begin "DOMContentLoaded" event */

    function getMeatspacePosition() {
        const statusDetails = document.querySelector("#statusDetails");
        const locationDetails = document.querySelector("#locationDetails");
        locationDetails.href = '';
        locationDetails.textContent = '';
        if (!navigator.geolocation) {
            statusDetails.textContent = 'Geolocation is not supported by your browser';
        } else {
            statusDetails.textContent = 'Locating …';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // success method
                    const userLatitude  = position.coords.latitude;
                    const userLongitude = position.coords.longitude;
                    //statusDetails.textContent = '';
                    //locationDetails.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
                    //locationDetails.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;

                    // calculate the distance from the user to every point in each state's paths
                    d3.json("resources/data/gz_2010_us_040_00_500k.json").then((data) =>{
                        let stateDistances = [];
                        data.features.forEach(state => {
                            let name = state.properties.NAME;
                            let coordinates = state.geometry.coordinates.join().split(',');
                            let distances = [];
                            for ( let i = 0; i < coordinates.length; i+=2 ) {
                                let pathLongitude = coordinates[i];
                                let pathLatitude = coordinates[i+1];
                                let distance = Math.sqrt(Math.pow(pathLatitude - userLatitude, 2) + Math.pow(pathLongitude - userLongitude, 2));
                                distances.push(distance);
                            }
                            // rough distance is the average of all distances
                            let roughDistance = distances.reduce((s,c) => s += c) / distances.length;
                            let stateDistance = { name, roughDistance}
                            stateDistances.push(stateDistance)
                        });
                        if (stateDistances.length > 0) {
                            stateDistances.sort((a,b) => {
                                if ( a.roughDistance >= b.roughDistance ) {
                                    return 1;
                                } else {
                                    return -1;
                                }
                            });
                            let userState = stateDistances[0].name;
                            statusDetails.textContent = `Are you roughly here: ${userState} ?`;
                        }
                    })
                },
                () => {
                    // error / failure method
                    statusDetails.textContent = 'Unable to retrieve your location';
                }
            );
        }
    }

    /*
    if (getMeatspacePosition && document.querySelector("#fetchLocation")){
        document.querySelector("#fetchLocation").addEventListener('click', getMeatspacePosition);
    }
    //*/
    //getMeatspacePosition();


  } /* cease "DOMContentLoaded" event */
);