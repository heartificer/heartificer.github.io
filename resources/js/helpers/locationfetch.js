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
                    const latitude  = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    statusDetails.textContent = '';
                    locationDetails.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
                    locationDetails.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
                },
                () => {
                    // error / failure method
                    statusDetails.textContent = 'Unable to retrieve your location';
                }
            );
        }
    }

    if (getMeatspacePosition && document.querySelector("#fetchLocation")){
        document.querySelector("#fetchLocation").addEventListener('click', getMeatspacePosition);
    }


  } /* cease "DOMContentLoaded" event */
);