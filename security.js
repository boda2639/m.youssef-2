// =====================================
// DEVICE SECURITY
// =====================================

import {
    db
} from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// =====================================
// DEVICE ID
// =====================================

function getDeviceId(){

    let id = localStorage.getItem("deviceId");

    if(!id){

        id = crypto.randomUUID();

        localStorage.setItem(
            "deviceId",
            id
        );

    }

    return id;

}




// =====================================
// VERIFY DEVICE
// =====================================

export async function verifyDevice(user){

    try{

        const ref = doc(
            db,
            "students",
            user.uid
        );

        const snap =
        await getDoc(ref);

        if(!snap.exists()){

            return true;

        }

        const data =
        snap.data();

        const deviceId =
        getDeviceId();

        if(!data.deviceId){

            await updateDoc(

                ref,

                {

                    deviceId,

                    deviceName:
                    navigator.userAgent,

                    lastLogin:
                    new Date().toLocaleString()

                }

            );

            return true;

        }

        if(data.deviceId !== deviceId){

            alert(
                "هذا الحساب يعمل على جهاز آخر."
            );

            return false;

        }

        return true;

    }

    catch(error){

        console.log(error);

        return true;

    }

}