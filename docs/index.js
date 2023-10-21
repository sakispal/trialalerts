document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent form from doing the default submit action
    
    const diseaseValue = encodeURIComponent(document.getElementById('diseaseInput').value);
    const cityValue = encodeURIComponent(document.getElementById('cityInput').value);
    const stateValue = encodeURIComponent(document.getElementById('stateInput').value);

    // Set the data in the fields of the second form
    document.getElementById('mce-DISEASE').value = diseaseValue;
    document.getElementById('mce-CITY').value = cityValue;
    document.getElementById('mce-STATE').value = stateValue;
    // Now you can show the second form, hide the first one, or do any other action you wish
  
    const baseUrl = "https://classic.clinicaltrials.gov/api/query/full_studies";
    const query = `?expr=${diseaseValue}+AND+SEARCH%5BLocation%5D%28AREA%5BLocationCity%5D+${cityValue}+AND+AREA%5BLocationState%5D+${stateValue}+AND+AREA%5BLocationStatus%5D+Recruiting%29&min_rnk=1&max_rnk=10&fmt=json`;

    fetch(baseUrl + query)
      .then(response => response.json())
      .then(data => {
          console.log(data);  // Process your data here
          updateDivWithStudyDetails(data, cityValue)
      })
      .catch(error => {
          console.error('Error fetching data:', error);
      });

    // Display the signup section
    document.getElementById('signupSection').style.display = 'block';
      
});

function updateDivWithStudyDetails(jsonData, userInput) {
    const studies = jsonData.FullStudiesResponse.FullStudies;

    let htmlContent = '';
    let matchingTrialCount = 0;  // Keep track of the number of matching trials
    for (let study of studies) {
        const identificationModule = study.Study.ProtocolSection.IdentificationModule || {};
        const officialTitle = identificationModule.OfficialTitle || 'N/A';
        const nctId = identificationModule.NCTId || '';
        const studyUrl = nctId ? `https://clinicaltrials.gov/ct2/show/${nctId}` : '#';
        const startDate = (study.Study.ProtocolSection.StatusModule && study.Study.ProtocolSection.StatusModule.StartDateStruct) ? study.Study.ProtocolSection.StatusModule.StartDateStruct.StartDate : 'N/A';

        const contactsLocationsModule = study.Study.ProtocolSection.ContactsLocationsModule || {};
        const locationList = (contactsLocationsModule.LocationList && contactsLocationsModule.LocationList.Location) || [];
        const centralContacts = (contactsLocationsModule.CentralContactList && contactsLocationsModule.CentralContactList.CentralContact) || [];
       
        // Initialize primaryContact with default values
        const primaryContact = centralContacts.length > 0 ? centralContacts[0] : {};

        const contactName = primaryContact.CentralContactName || 'N/A';
        const contactRole = primaryContact.CentralContactRole || 'N/A';
        const contactEmail = primaryContact.CentralContactEMail || 'N/A';
        const contactPhone = primaryContact.CentralContactPhone || 'N/A';

        // Filter locations based on user input
        let matchingLocations = [];
        for (let loc of locationList) {
            const locationString = [loc.LocationFacility, loc.LocationCity, loc.LocationState, loc.LocationCountry].join(', ').trim(", ");
            if (locationString.toLowerCase().includes(userInput.toLowerCase())) {
                matchingLocations.push(locationString);
            }
        }
        const locationStr = matchingLocations.join('; ');
        // Extract the primary contact's details
        const primaryContactInfo = `${contactName} (${contactRole})<br>Email: ${contactEmail}<br>Phone: ${contactPhone}`;

        // If there's a match, append the details to the HTML content
        if (matchingLocations.length > 0) {
            matchingTrialCount++;
            htmlContent += `<div class="study-block bg-white p-4 rounded shadow-md mb-4">`;  // Added Tailwind classes for basic styling
            htmlContent += `<div class="study-title font-bold mb-2">Title: ${officialTitle}</div>`;
            htmlContent += `<div class="study-location mb-2">Location: ${locationStr}</div>`;
            htmlContent += `<div class="study-start-date mb-2">Start Date: ${startDate}</div>`;
            htmlContent += `<div class="study-contact mb-2">Main Contact: ${primaryContactInfo}</div>`;
            htmlContent += `<div class="study-url"><a href="${studyUrl}" target="_blank" class="text-blue-500 hover:underline">View Study</a></div>`;
            htmlContent += `</div>`;
        }
        
    }

    // Update the result count H2 element
    const resultCountElement = document.getElementById('resultCount');
    resultCountElement.textContent = `We found ${matchingTrialCount} matching trials`;
    const targetDiv = document.getElementById('response-data');
    targetDiv.innerHTML = htmlContent;
}

