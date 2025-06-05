import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite");
// const query = db.query("select * from books");
// console.log(query.get());

const getAllBooks = () => {
    try {
        const query = db.query('select * from books;');
        return query.all()
    }catch (error){
        console.log(error);
        return []
    }
}
const getBookId = (id: number) => {
    try {
        const query = db.query('select * from books where id=$id;');
        return query.get($id:id)
    }catch (error){
        console.log(error);
        return []
    }
}

console.log(getAllBooks());
