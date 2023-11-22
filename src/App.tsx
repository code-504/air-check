import Card, { ListCard, SimpleCard } from "./components/Card";
import Header from "./components/Header";
import lamp from "./assets/lamp.svg";
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Doughnut, Line } from 'react-chartjs-2';
import { useEffect, useState } from "react"
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Chart as ChartJS,
  TimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Button } from "./components/ui/button";

import { getActualData, getPredictionData, getTempData, postActualData, getAIData, updateDevice } from "./lib/api";

// Resources
import iaq from "@/assets/aq.svg";
import co2 from "@/assets/co2.svg";
import temp from "@/assets/device_thermostat.svg";
import hum from "@/assets/humidity_percentage.svg";
import gas from "@/assets/propane.svg";
import voc from "@/assets/water_voc.svg";
import { db } from "./lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Moment from 'moment';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  zoomPlugin,
  Title,
  Tooltip,
  Legend,
  Filler,
);

  /*const labels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"]
  const data = {
    labels: labels,
    datasets: [{
      label: 'My First Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: true,
      borderColor: '#A396E6',
      backgroundColor: (context:any) => {
        const bgColor = [
          'rgba(219, 212, 254, 0.3)',
          'rgba(163, 150, 230, 0)'
        ];

        if (!context.chart.chartArea) {
          return;
        }

        const { ctx, chartArea: { top, bottom } } = context.chart;

        const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
        gradientBg.addColorStop(0, bgColor[0])
        gradientBg.addColorStop(1, bgColor[1])

        return gradientBg;
      },
      tension: 0.5
    }]
  };*/

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false,
      },
      zoom: {
        pan: {
            enabled: true,
            mode: 'x'
        },
        zoom: {
            pinch: {
                enabled: true       // Enable pinch zooming
            },
            wheel: {
                enabled: true       // Enable wheel zooming
            },
            mode: 'x',
        }
      }
    },
    scales: {
      y: {
        display: false,
      },
      x: {
        grid: {
          color: "#B9B9BD",
          drawTicks: false
        },
        border: {
          display: false, 
          dash: [2, 25]
        },
        labels: false,
      },
    }
  };

export default function App() {

  const [ realTimeData, setRealTimeData ] = useState<InfoData>({ CO2: 0, hum: 0, iaq: 0, press: 0, temp: 0, VOC: 0 });
  const [ predictionData, setPredictionData ] = useState<InfoData>();
  const [ aiData, setaiData ] = useState<InfoData>();
  const [ stateUpdateDevice, setStateUpdateDevice ] = useState<boolean>(true)

  const [data, setData] = useState<{ labels: string[]; datasets: any[] }>({
    labels: [],
    datasets: [],
  });

  const [dataTemp, setDataTemp] = useState<{ labels: string[]; datasets: any[] }>({
    labels: [],
    datasets: [],
  });

  const [dataHum, setDataHum] = useState<{ labels: string[]; datasets: any[] }>({
    labels: [],
    datasets: [],
  });

  const [dataCO2, setDataCO2] = useState<{ labels: string[]; datasets: any[] }>({
    labels: [],
    datasets: [],
  });

  const [dataVOC, setDataVOC] = useState<{ labels: string[]; datasets: any[] }>({
    labels: [],
    datasets: [],
  });

  const [dataPress, setDataPress] = useState<{ labels: string[]; datasets: any[] }>({
    labels: [],
    datasets: [],
  });

  const getRealTimeData = async () => {
    const data = await getActualData();

    if (data)
      setRealTimeData(data);
  }

  const updateRealTimeState = async (estado: boolean) => {
    await postActualData(estado);
  }

  const getPrediction = async () => {
    const data = await getPredictionData();

    if (data)
      setPredictionData({
        CO2   : data.CO2,
        VOC   : data.VOC,
        hum   : data.hum,
        iaq   : data.iaq,
        press : data.press,
        temp  : data.temp
      })
  }

  useEffect(() => {
    //getRealTimeData();
    getPrediction();
  }, [])

  const updateDeviceState = async () => {
    await updateDevice(stateUpdateDevice);
  }

  useEffect(() => {
    updateDeviceState()
  }, [stateUpdateDevice])
  

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "chart", "actual"), (doc) => {
      if (doc.exists())
        setRealTimeData({
          CO2     : Math.round((Number(doc.data().CO2) + Number.EPSILON) * 100) / 100,
          VOC     : Math.round((Number(doc.data().VOC) + Number.EPSILON) * 100) / 100,
          hum     : Math.round((Number(doc.data().hum) + Number.EPSILON) * 100) / 100,
          iaq     : Math.round((Number(doc.data().iaq) + Number.EPSILON) * 100) / 100,
          press   : Math.round((Number(doc.data().press) + Number.EPSILON) * 100) / 100,
          temp    : Math.round((Number(doc.data().temp) + Number.EPSILON) * 100) / 100
        })
    });
  }, [])

  useEffect(() => {
    // Realiza la consulta a Firestore
    const fetchData = async () => {
      try {
        const snapshot = await getTempData();
        const snapshotAI = await getAIData();

        // Normal data
        const iaqs: number[] = [];
        const temps: number[] = [];
        const hums: number[] = [];
        const CO2s: number[] = [];
        const VOCs: number[] = [];
        const presss: number[] = [];

        // AI data
        const iaqsAI: number[] = [];
        const tempsAI: number[] = [];
        const humsAI: number[] = [];
        const CO2sAI: number[] = [];
        const VOCsAI: number[] = [];
        const presssAI: number[] = [];

        // normal label
        const labels: string[] = [];

        // AI label
        const labelsAI: string[] = [];
      
        // Normal data push
        const promedio = calcularPromedioPorDia(snapshot)

        for (const clave in promedio) {
          if (promedio.hasOwnProperty(clave)) {
            iaqs.push(promedio[clave].iaq);
            temps.push(promedio[clave].temp);
            hums.push(promedio[clave].hum);
            CO2s.push(promedio[clave].CO2);
            VOCs.push(promedio[clave].VOC);
            presss.push(promedio[clave].press);
            labels.push(promedio[clave].date);
          }
        }

        snapshotAI.forEach((doc) => {
          // Suponiendo que tienes un campo "timestamp" en tus documentos
          const iaq   = Number(doc.iaq);
          const temp  = Number(doc.temp);
          const hum   = Number(doc.hum);
          const CO2   = Number(doc.CO2);
          const VOC   = Number(doc.VOC);
          const press = Number(doc.press);
          //iaqs.push(iaq);

          // Suponiendo que también tienes un campo "fecha" en tus documentos
          const fecha = doc.date.toDate();
          //labels.push(Moment(fecha).format('MMM DD'));

          iaqsAI.push(iaq);
            tempsAI.push(temp);
            humsAI.push(hum);
            CO2sAI.push(CO2);
            VOCsAI.push(VOC);
            presssAI.push(press);
            labelsAI.push(Moment(fecha).format('MMM DD'));
        });

        console.log(iaqsAI)

        /*snapshot.forEach((doc) => {
          // Suponiendo que tienes un campo "timestamp" en tus documentos
          const iaq   = doc.iaq;
          const temp  = doc.temp;
          const hum   = doc.hum;
          const CO2   = doc.CO2;
          const VOC   = doc.VOC;
          const press = doc.press;
          //iaqs.push(iaq);

          // Suponiendo que también tienes un campo "fecha" en tus documentos
          const fecha = doc.date.toDate();
          //labels.push(Moment(fecha).format('MMM DD'));

          if (!labels.includes(Moment(fecha).format('MMM DD'))) {
            iaqs.push(iaq);
            temps.push(temp);
            hums.push(hum);
            CO2s.push(CO2);
            VOCs.push(VOC);
            presss.push(press);
            labels.push(Moment(fecha).format('MMM DD'));
          }
        });*/

        // Actualiza el estado con los datos de Firestore
        setData({
          labels: labels,
          datasets: [
            {
              label: 'Timestamp',
              data: iaqs,
              fill: true,
              borderColor: '#A396E6',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(219, 212, 254, 0.3)',
                  'rgba(163, 150, 230, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
            {
              label: 'Predicción',
              data: iaqsAI,
              fill: true,
              borderColor: '#FF8686',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(254, 212, 212, 0.3)',
                  'rgba(230, 150, 174, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
          ],
        });

        setDataTemp({
          labels: labels,
          datasets: [
            {
              label: 'Timestamp',
              data: temps,
              fill: true,
              borderColor: '#F7ECCD',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(255, 246, 222, 0.3)',
                  'rgba(230, 213, 167, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
            {
              label: 'Predicción',
              data: tempsAI,
              fill: true,
              borderColor: '#FF8686',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(254, 212, 212, 0.3)',
                  'rgba(230, 150, 174, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
          ],
        });

        setDataHum({
          labels: labels,
          datasets: [
            {
              label: 'Timestamp',
              data: hums,
              fill: true,
              borderColor: '#D1EDF5',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(222, 253, 255, 0.3)',
                  'rgba(167, 219, 230, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
            {
              label: 'Predicción',
              data: humsAI,
              fill: true,
              borderColor: '#FF8686',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(254, 212, 212, 0.3)',
                  'rgba(230, 150, 174, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
          ],
        });

        setDataCO2({
          labels: labels,
          datasets: [
            {
              label: 'Timestamp',
              data: CO2s,
              fill: true,
              borderColor: '#D1EDF5',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(222, 253, 255, 0.3)',
                  'rgba(167, 219, 230, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
            {
              label: 'Predicción',
              data: CO2sAI,
              fill: true,
              borderColor: '#FF8686',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(254, 212, 212, 0.3)',
                  'rgba(230, 150, 174, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
          ],
        });

        setDataVOC({
          labels: labels,
          datasets: [
            {
              label: 'Timestamp',
              data: VOCs,
              fill: true,
              borderColor: '#D1EDF5',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(222, 253, 255, 0.3)',
                  'rgba(167, 219, 230, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
            {
              label: 'Predicción',
              data: VOCsAI,
              fill: true,
              borderColor: '#FF8686',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(254, 212, 212, 0.3)',
                  'rgba(230, 150, 174, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
          ],
        });

        setDataPress({
          labels: labels,
          datasets: [
            {
              label: 'Timestamp',
              data: presss,
              fill: true,
              borderColor: '#D1EDF5',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(222, 253, 255, 0.3)',
                  'rgba(167, 219, 230, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
            {
              label: 'Predicción',
              data: presssAI,
              fill: true,
              borderColor: '#FF8686',
              backgroundColor: (context:any) => {
                const bgColor = [
                  'rgba(254, 212, 212, 0.3)',
                  'rgba(230, 150, 174, 0)'
                ];

                if (!context.chart.chartArea) {
                  return;
                }

                const { ctx, chartArea: { top, bottom } } = context.chart;

                const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                gradientBg.addColorStop(0, bgColor[0])
                gradientBg.addColorStop(1, bgColor[1])

                return gradientBg;
              },
              tension: 0.5,
            },
          ],
        });
      } catch (error) {
        console.error('Error al obtener datos de Firestore', error);
      }
    };

    fetchData(); // Llama a la función de obtención de datos cuando el componente se monta

  }, [])

  const calcularPromedioPorDia = (historial: any) => {
    const promediosPorDia:any = {};

    historial.forEach((registro:any) => {
      const fecha = new Date(registro.date.toDate()); // Convierte el timestamp a objeto Date
      const fechaStr = fecha.toISOString().split('T')[0]; // Obtiene la fecha en formato YYYY-MM-DD

      // Inicializa el acumulador para el día si es la primera vez que se encuentra esa fecha
      if (!promediosPorDia[fechaStr]) {
        promediosPorDia[fechaStr] = {
          CO2: 0,
          VOC: 0,
          hum: 0,
          iaq: 0,
          press: 0,
          temp: 0,
          date: "",
          contador: 0,
        };
      }

      // Acumula los valores para calcular el promedio al final
      promediosPorDia[fechaStr].CO2 += registro.CO2;
      promediosPorDia[fechaStr].VOC += registro.VOC;
      promediosPorDia[fechaStr].hum += registro.hum;
      promediosPorDia[fechaStr].iaq += registro.iaq;
      promediosPorDia[fechaStr].press += registro.press;
      promediosPorDia[fechaStr].temp += registro.temp;
      promediosPorDia[fechaStr].date = Moment(registro.date.toDate()).format('MMM DD');

      // Incrementa el contador para calcular el promedio al final
      promediosPorDia[fechaStr].contador += 1;
    });

    // Calcula el promedio dividiendo cada acumulado por el contador
    Object.keys(promediosPorDia).forEach((fechaStr) => {
      const promedioDia = promediosPorDia[fechaStr];
      promediosPorDia[fechaStr] = {
        CO2: promedioDia.CO2 / promedioDia.contador,
        VOC: promedioDia.VOC / promedioDia.contador,
        hum: promedioDia.hum / promedioDia.contador,
        iaq: promedioDia.iaq / promedioDia.contador,
        press: promedioDia.press / promedioDia.contador,
        temp: promedioDia.temp / promedioDia.contador,
        date: promedioDia.date
      };
    });

    return promediosPorDia;
  };

  return (
    <div className="container bg-[#F9F9F9] w-full h-screen">
      <Header />

      <div className="py-4 space-y-4">
        <Card className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={lamp} className="mr-4" />
              <div className="flex flex-col">
                <p>Dispositivo</p>
                <Card.Title>Encendido</Card.Title>
              </div>
            </div>

            <Switch checked={stateUpdateDevice} onCheckedChange={() => setStateUpdateDevice(!stateUpdateDevice)} />
        </Card>
        {
          stateUpdateDevice && (
            <>
              <Card className="flex flex-col justify-between space-y-4">
                <Card.Title>Información en tiempo real</Card.Title>
                
                <div className="grid grid-cols-2">
                  <SimpleCard title="IAQ" value={ realTimeData?.iaq } type="ppm" state="Good" />
                  <SimpleCard title="Temperatura" value={ realTimeData?.temp } type="°C" state="Good" />
                  <SimpleCard title="Humedad" value={ realTimeData?.hum } type="%" state="Bad" />
                  <SimpleCard title="CO2" value={ realTimeData?.CO2 } type="ppm" state="Good" />
                  <SimpleCard title="VOC" value={ realTimeData?.VOC } type="ppm" state="Excelent"/>
                </div>

                <Button onClick={() => updateRealTimeState(true)}>Actualizar</Button>
              </Card>

              <Card className="flex flex-col space-y-4">
                <Card.Title>Predicción de mañana</Card.Title>

                <div className="flex flex-col space-y-2 w-full">
                  <ListCard icon={iaq} title="IAQ" value={ predictionData?.iaq } type="ppm" state="Good" />
                  <ListCard icon={temp} title="Temperatura" value={ predictionData?.temp } type="°C" state="Good" />
                  <ListCard icon={hum} title="Humedad" value={ predictionData?.hum } type="%" state="Bad" />
                  <ListCard icon={co2} title="CO2" value={ predictionData?.CO2 } type="ppm" state="Good" />
                  <ListCard icon={voc} title="VOC" value={ predictionData?.VOC } type="ppm" state="Excelent"/>
                  { //<ListCard icon={gas} title="Gas" value={ predictionData?.iaq } type="ohm" state="Average" />
                  }
                </div>
              </Card> 
              <Card className="flex flex-col space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Card.Title>Historial</Card.Title>

                  <Select defaultValue="week">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="week">Hace una semana</SelectItem>
                        <SelectItem value="month">Hace un mes</SelectItem>
                        <SelectItem value="all">Desde simepre</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs defaultValue="IAQ" className="w-full">
                  <TabsList className="flex justify-start w-full max-w-[420px] overflow-x-auto overflow-y-hidden mb-8">
                    <TabsTrigger value="IAQ">IAQ</TabsTrigger>
                    <TabsTrigger value="temp">Temperatura</TabsTrigger>
                    <TabsTrigger value="hum">Humedad</TabsTrigger>
                    <TabsTrigger value="co2">C02</TabsTrigger>
                    <TabsTrigger value="voc">VOC</TabsTrigger>
                    <TabsTrigger value="press">Presión</TabsTrigger>
                  </TabsList>
                  <TabsContent value="IAQ">
                    <div className="w-full">
                      <Line options={options} data={data} className="w-full" />
                    </div>
                  </TabsContent>
                  <TabsContent value="temp">
                    <div className="w-full">
                    <Line options={options} data={dataTemp} className="w-full" />
                    </div>
                  </TabsContent>
                  <TabsContent value="hum">
                    <div className="w-full">
                      <Line options={options} data={dataHum} className="w-full" />
                    </div>
                  </TabsContent>
                  <TabsContent value="co2">
                    <div className="w-full">
                      <Line options={options} data={dataCO2} className="w-full" />
                    </div>
                  </TabsContent>
                  <TabsContent value="voc">
                    <div className="w-full">
                      <Line options={options} data={dataVOC} className="w-full" />
                    </div>
                  </TabsContent>
                  <TabsContent value="press">
                    <div className="w-full">
                      <Line options={options} data={dataPress} className="w-full" />
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </>
          )
        }
      </div>
    </div>
  )
}
