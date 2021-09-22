import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Doughnut, Line } from "react-chartjs-2";
const Contents = () => {
  const [confirmedData, setConfirmedData] = useState({});
  const [quarantinedData, setQuarantinedData] = useState({});
  const [comparedData, setComparedData] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await axios.get("https://api.covid19api.com/total/dayone/country/kr");
      makeData(res.data);
    };
    // 각 달의 마지막 날짜에 대한 자료만 필요하므로  reduce 사용
    const makeData = (items) => {
      const arr = items.reduce((acc, cur) => {
        const currentDate = new Date(cur.Date);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const date = currentDate.getDate();

        const confirmed = cur.Confirmed;
        const active = cur.Active;
        const death = cur.Deaths;
        const recovered = cur.Recovered;

        const findItem = acc.find((a) => a.year === year && a.month === month);

        if (!findItem) {
          acc.push({
            year: year,
            month: month,
            date: date,
            confirmed: confirmed,
            active: active,
            death: death,
            recovered: recovered,
          });
        }
        // 이곳에서 값을 설정하면 상단의 선언한 곳도 동일하게 적용이 됨
        if (findItem && findItem.date < date) {
          findItem.active = active;
          findItem.death = death;
          findItem.date = date;
          findItem.year = year;
          findItem.month = month;
          findItem.confirmed = confirmed;
          findItem.recovered = recovered;
        }

        return acc;
      }, []);

      const labels = arr.map((a) => `${a.month}월`);
      setConfirmedData({
        labels: labels,
        datasets: [
          { label: "국내 누적 확진자", backgroundColor: "salmon", fill: true, data: arr.map((a) => a.confirmed) },
          
        ],
      });

      setQuarantinedData({
        labels: labels,
        datasets: [{ label: "월별 격리자 현황", borderColor: "salmon", fill: false, data: arr.map((a) => a.active) }],
      });

      const last = arr[arr.length-1]
      console.log(arr)
      console.log(last)
      console.log(last.recovered)
      
      setComparedData({
        labels: ["확진자", "격리해제", "사망"],
        datasets: [
          {
            label: "누적 확진, 해제, 사망 비율",
            backgroundColor: ["#ff3d67", "#059bff", "#ffc233"],
            borderColor: ["#ff3d67", "#059bff", "#ffc233"],
            fill: false,
            data: [last.confirmed, last.recovered, last.death],
          },
        ],
      });
    }; // makeData() end

    fetchEvents();
  }, []);

  return (
    <section>
      <h2>국내 코로나 현황</h2>
      <div className="contents">
        <div>
          <Bar
            
            data={confirmedData}
            options={
              ({ titile: { display: true, text: "누적 확진자 추이", fontSize: 16 } },
              { legend: { display: true, position: "bottom" } })
            }
          />
        </div>
        <div>
          <Line
            data={quarantinedData}
            options={
              ({ titile: { display: true, text: "월별 격리자 현황", fontSize: 16 } },
              { legend: { display: true, position: "bottom" } })
            }
          />
        </div>
        <div>
          <Doughnut
            data={comparedData}
            options={
              ({
                titile: { display: true, text: `누적, 확진, 해제, 사망${new Date().getMonth() + 1}월`, fontSize: 16 },
              },
              { legend: { display: true, position: "bottom" } })
            }
          />
        </div>
      </div>
    </section>
  );
};

export default Contents;
