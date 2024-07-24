import React, { useState } from "react";

export default function App() {
  const [subscribeTopic, setSubscribeTopic] = useState();
  const [publishTopic, setPublishTopic] = useState();
  const [publishData, setPublishData] = useState();
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "subscribeTopic") {
      setSubscribeTopic(value);
    } else if (name === "publishTopic") {
      setPublishTopic(value);
    } else {
      setPublishData(value);
    }
  };
  return (
    <div className="min-h-screen">
      <div className="flex gap-4 m-10">
        {/* Subscribe Settings */}
        <div className="card bg-base-100 w-96 shadow-lg border">
          <div className="card-body">
            <h2 className="flex card-title justify-center">
              Subscribe Settings
            </h2>
            <div className="font-monsterrat ">
              <div className="flex flex-col gap-4">
                <label className="input input-bordered flex items-center gap-2">
                  <span> Topic:</span>
                  <input
                    type="text"
                    className="grow"
                    name="subscribeTopic"
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div className="flex flex-col justify-center">
                <button className="btn btn-primary mt-4">Save</button>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Publish Settings */}
        <div className="card bg-base-100 w-96 shadow-lg border">
          <div className="card-body">
            <h2 className="flex card-title justify-center">Publish Settings</h2>
            <div className="font-monsterrat ">
              <div className="flex flex-col gap-4">
                <label className="input input-bordered flex items-center gap-2">
                  <span> Topic:</span>
                  <input
                    type="text"
                    className="grow"
                    name="publishTopic"
                    onChange={handleChange}
                  />
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <span> Data:</span>
                  <input
                    type="text"
                    className="grow"
                    name="publishData"
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div className="flex flex-col justify-center">
                <button className="btn btn-primary mt-4">Publish</button>
              </div>
            </div>
          </div>
        </div>{" "}
        <div className="card bg-base-100 w-96 shadow-lg border">
          <div className="card-body">
            <h2 className="flex card-title justify-center">Messages</h2>
            <div className="font-monsterrat ">
              Subscribed to:{" "}
              <span className="text-primary">{subscribeTopic}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
