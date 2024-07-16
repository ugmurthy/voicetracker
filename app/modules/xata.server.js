import _ from 'lodash';

const db = {}

db.addUser = async (user) => {
    // add user to database (INSERT INTO users (email, name, password))
    /* returns {
         "id": "rec_cq8gubfhqm2k22v7g3u0",
        "xata": {
            "createdAt": "2024-07-12T11:10:37.847892Z",
            "updatedAt": "2024-07-12T11:10:37.847892Z",
            "version": 0
        }
    }
  */
    const body = JSON.stringify(user);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XATA_API_KEY}`
          },
            body: body  // body data type must match "Content-Type" header
        }
    const URL= process.env.XATA_URL+"/tables/users/data?columns=id"
    const response = await fetch(URL, options);
    if (response.ok) {
        const data = await response.json()
        return data
    } else {
        console.log("Error inserting record to user table")
        return null
    }
}

db.findUserById = async (id) => {
    // find user by id (SELECT * FROM users WHERE id = id)
    // return user
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XATA_API_KEY}`
          }
        }
    const URL= process.env.XATA_URL+"/tables/users/data/"+id
    const response = await fetch(URL, options);
    if (response.ok) {
        const data = await response.json()
        return data
    } else {
        console.log("Error finding record to user table")
        return null
    }
}
/// get user by email
/*
const options = {
  method: 'POST',
  headers: {Authorization: 'Bearer <XATA_API_KEY>', 'Content-Type': 'application/json'},
  body: '{"columns":["email","name","password"],"filter":{"email":"kartik@sample.com"},"page":{"size":15}}'
};

fetch('https://u-g-murthy-s-workspace-8a25u9.ap-southeast-2.xata.sh/db/run-assist:main/tables/users/query', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
*/
db.findUserByEmail = async (email) => {
    // find user by email (SELECT * FROM users WHERE email = email)
    // return user
    const body = JSON.stringify({
        "columns":["email","name","password"],
        "filter":{"email":email}
    });
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XATA_API_KEY}`
          },
            body: body  // body data type must match "Content-Type" header
        }
    const URL= process.env.XATA_URL+"/tables/users/query"
    const response = await fetch(URL, options);
    if (response.ok) {
        const data = await response.json()
        return data
    } else {
        console.log("Error finding UserByEmail ",email)
        return null
    }
}

db.addAuthtoken = async ({selector,hashedValidator,userId}) =>{
    // add authtoken to database (INSERT INTO authtokens (selector, hashedValidator, userId))
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XATA_API_KEY}`
          },    
            body: JSON.stringify({selector,hashedValidator,userId})  // body data type must match "Content-Type" header
    }
    const URL= process.env.XATA_URL+"/tables/authtokens/data?columns=id"
    const response = await fetch(URL, options);
    if (response.ok) {  //200
        const data = await response.json()
        return data
        /* Note return pattern below for token insert
        {
            "id": "rec_cq9484vhqm2k22v7htvg",
            "xata": {
                "createdAt": "2024-07-13T09:08:35.161127Z",
                "updatedAt": "2024-07-13T09:08:35.161127Z",
                "version": 0
            }
        }
        */
    } else {
        console.log("Error inserting record to authtokens table")
        return null
    }
}
db.authtokenDeleteMany = async (userId) => {
    //1 get all authtokens for a user (SELECT * FROM authtokens WHERE userId.id = userId)
    let body = JSON.stringify({
        "columns":["id"],
        "filter":{"userId.id":userId}
    });
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XATA_API_KEY}`
          },
            body: body  // body data type must match "Content-Type" header
        }
    let URL= process.env.XATA_URL+"/tables/authtokens/query"
    //console.log("URL ",URL)
    //console.log("options ",options)

    let response = await fetch(URL, options);

    if (!response.ok) {
        console.log("Error finding authtokens for user ",userId)
         return null 
    }
    let data = await response.json()
    const ids = _.map(data.records, 'id');
    console.log("Tokens ids to be deleted ",ids);

    //2 delete all authtokens for a user (DELETE FROM authtokens WHERE id is in ids)
    // reusing body,options,response,data and URL variables 
    const operations = ids.map(id => ({ delete: {table:"authtokens", id }}));
    body = JSON.stringify({operations});
    options = { 
            method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${process.env.XATA_API_KEY}`
               },
                 body: body  // body data type must match "Content-Type" header
             }
         // delete the tokens from the database
    URL= process.env.XATA_URL+"/transaction"
    response = await fetch(URL, options);
    if (!response.ok) {
        console.log("Error deleting authtokens for user ",userId)
        return null
    }
    data = await response.json()
    const count = _.sum(_.map(data.result,'rows')) // sum of rows affected in each operation
    return count;
    // return number of authtokens deleted
}

db.findTokendBySelector = async (selector) => {
    // find authtoken by selector (SELECT * FROM authtokens WHERE selector = selector)
    let body = JSON.stringify({
        "columns":["*"],
        "filter":{"selector":selector}
    });
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XATA_API_KEY}`
          },
            body: body  // body data type must match "Content-Type" header
        }
    let URL= process.env.XATA_URL+"/tables/authtokens/query"
    let response = await fetch(URL, options);
    if (response.ok) {
        const data = await response.json()
        return data
    } else {
        console.log("Error finding authtoken by selector ",selector)
        return null
    }
}
export default db