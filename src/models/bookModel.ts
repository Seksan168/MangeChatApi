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
        return query.get({$id:id});
    }catch (error){
        console.log(error);
        return []
    }
}
const createBook = (book: any) => {
    try {
        const query = db.query(`
            INSERT INTO books ("name", "author", "price") 
            VALUES ($name, $author, $price);
        `)
        return query.run({
            $name :book.name,
            $author: book.author,
            $price: book.price
        })
    } catch(error){
        console.log(error);
        
    }
}
const updateBook = (id:number,book:any) => {
    try {
        const query = db.query(`
            UPDATE books 
            SET 
                "name" = $name, 
                "author" = $author, 
                "price" = $price 
            WHERE id = $id;
        `);

        return query.run({
            $id: id,
            $name: book.name,
            $author: book.author,
            $price: book.price
        });
    } catch (error) {
        console.error('Error updating book:', error);
    }
};
const deleteBook = (id: number) => {
        try {
    
        const query = db.query(`
            DELETE FROM books 
            WHERE id = $id;
        `);
        return query.run({
            $id: id,
        });
    } catch (error) {
        console.log(error);
    }
}

console.log(deleteBook(6,
));
