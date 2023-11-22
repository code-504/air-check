
import { db } from './firebase';
import { getDoc, getDocs, doc, updateDoc, collection, query, orderBy } from 'firebase/firestore';

// Obtener datos de tiempo real
export async function getActualData() {

    const docRef = doc(db, "chart", "actual");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return {
            CO2     : Math.round((Number(docSnap.data().CO2) + Number.EPSILON) * 100) / 100,
            VOC     : Math.round((Number(docSnap.data().VOC) + Number.EPSILON) * 100) / 100,
            hum     : Math.round((Number(docSnap.data().hum) + Number.EPSILON) * 100) / 100,
            iaq     : Math.round((Number(docSnap.data().iaq) + Number.EPSILON) * 100) / 100,
            press   : Math.round((Number(docSnap.data().press) + Number.EPSILON) * 100) / 100,
            temp    : Math.round((Number(docSnap.data().temp) + Number.EPSILON) * 100) / 100
        };
    } else {
        return null;
    }
}

// Actualizar los datos
export async function postActualData(estado: boolean) {
    const docRef = doc(db, "estado", "actualizar");
    
    try {
        await updateDoc(docRef, {
            estado: estado
        });
    } catch (err) {
        console.log(err)
    }
}

// Obtener los datos de la predicción
export async function getPredictionData() {
    const docRef = doc(db, "chart", "predictions");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return {
            CO2     : Math.round((Number(docSnap.data().CO2) + Number.EPSILON) * 100) / 100,
            VOC     : Math.round((Number(docSnap.data().VOC) + Number.EPSILON) * 100) / 100,
            hum     : Math.round((Number(docSnap.data().hum) + Number.EPSILON) * 100) / 100,
            iaq     : Math.round((Number(docSnap.data().iaq) + Number.EPSILON) * 100) / 100,
            press   : Math.round((Number(docSnap.data().press) + Number.EPSILON) * 100) / 100,
            temp    : Math.round((Number(docSnap.data().temp) + Number.EPSILON) * 100) / 100
        };
    } else {
        return null;
    }
}

// Obtener datos de tiempo real
export async function getTempData() {

    const collectionRef = collection(db, "historial");
    const docsSnap = await getDocs(query(collectionRef, orderBy("date")));

    let docsList:any[] = [];

    if (docsSnap.size > 0)
        docsSnap.forEach((doc) => {
            docsList.push(doc.data())
        });
      
    return docsList;
}

// Obtener datos de tiempo real
export async function getAIData() {

    const collectionRef = collection(db, "average_prediction");
    const docsSnap = await getDocs(query(collectionRef, orderBy("date")));

    let docsList:any[] = [];

    if (docsSnap.size > 0)
        docsSnap.forEach((doc) => {
            docsList.push(doc.data())
        });
      
    return docsList;
}

// Actualizar encendido
export async function updateDevice(estado: boolean) {
    const docRef = doc(db, "estado", "id_estado");
    
    try {
        await updateDoc(docRef, {
            encendido: estado
        });
    } catch (err) {
        console.log(err)
    }
}