import {unlink} from "node:fs"

export function delete_file(fname) {
    unlink(fname,(err)=>{
        if (err) {
        console.log("Error : deleting file ",fname)
        } else {
            console.log("File deleted successfully ",fname)
        }
    })
} 
