import "./Profile.css";
import profilePic from "../assets/profile-pic.svg";
import { useState } from 'react';
import { getLoggedInUser } from '../lib/getLoggedInUser';

const STREAMING_SERVICES = [
  'Netflix',
  'Hulu',
  'Disney+',
  'Crunchyroll',
  'Prime Video',
  'Apple TV',
  'Peacock',
  'Paramount+',
];

export default function Profile() {
  // const [selectedServices, setSelectedServices] = useState([]);
  // const user = getLoggedInUser();

  // function toggleService(service) {
  //   setSelectedServices((prev) =>
  //     prev.includes(service)
  //       ? prev.filter((item) => item !== service)
  //       : [...prev, service]
  //   );
  // }
    const [selectedServices, setSelectedServices] = useState(() => {
      return JSON.parse(localStorage.getItem("selectedServices")) || [];
    });
    const user = getLoggedInUser();

    function toggleService(service) {
      setSelectedServices((prev) => {
        // if the service is already selected, remove it.
        // otherwise, add it to the list of selected services.
        const next = prev.includes(service)
          ? prev.filter((selected) => selected !== service)
          : [...prev, service];
        
         localStorage.setItem("selectedServices", JSON.stringify(next));
        return next;
      });
    }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <img
              className="profile-avatar"
              src={profilePic}
              alt={`${user?.username || 'User'}'s profile`}
            />
          </div>
          <div className="profile-description">
            <p className="profile-kicker">ACCOUNT</p>
            <h1 className="profile-username">@{user?.username || 'Error'}</h1>
            <p className="profile-subtitle">Your watch identity.</p>
          </div>
        </div>

        <div className="service-section">
          <div className="section-title-row">
            <h2 className="service-section-title">STREAMING SERVICES</h2>
            <span className="service-count">
              {selectedServices.length} selected
            </span>
          </div>

          <p className="service-pick">
            Pick the platforms you use.
          </p>

          <div className="service-grid">
            {STREAMING_SERVICES.map((service) => {
              //variable to check if the current service is included in the
              // selectedServices array, which is used to determine the
              // button's appearance and label.
              const isSelected = selectedServices.includes(service);

              return (
                <button
                  key={service}
                  type="button"
                  className={`service-tile ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleService(service)}
                >
                  <span className="service-label-top">
                    {isSelected ? 'WATCH ON' : 'ADD'}
                  </span>
                  <span className="service-label-name">{service}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}