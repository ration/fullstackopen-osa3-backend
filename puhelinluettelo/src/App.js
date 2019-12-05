import React, {useState, useEffect} from 'react';
import puhelinluetteloService from './services/puhelinluettelo';
import './App.css';

const Person = (props) => {

    return (
        <>
            <div>{props.person.name} {props.person.number}
                <button onClick={() => props.delete(props.person)}>delete</button>
            </div>
        </>
    );
};

const Persons = (props) => {
    const matchesFilter = (person) => {
        return !props.filter || person.name.toLowerCase().includes(props.filter.toLowerCase());
    };
    return (
        <>
            {props.persons && props.persons.filter(person => matchesFilter(person)).map(person =>
                <Person key={person.id} person={person} delete={props.delete}/>)}
        </>
    )
};

const PersonForm = (props) => {
    return (<>
        <h2>add a new</h2>
        <form onSubmit={props.addPerson}>
            <div>
                name: <input onChange={(e) => props.setNewName(e.target.value)} value={props.newName}/>
            </div>
            <div>
                number: <input onChange={(e) => props.setNewNumber(e.target.value)} value={props.newNumber}/>
            </div>
            <div>
                <button type="submit">add</button>
            </div>
        </form>
    </>)
};

const Notification = ({message}) => {
    if (message === null) {
        return null
    }

    return (
        <div className={message.level}>
            {message.text}
        </div>
    )
};

const App = () => {
    const [persons, setPersons] = useState([]);
    const [newName, setNewName] = useState('');
    const [newNumber, setNewNumber] = useState('');
    const [filter, setFilter] = useState('');
    const [message, setMessage] = useState(null);


    const updatePersons = async () => {
        setPersons(await puhelinluetteloService.fetchPersons());
    };

    useEffect(() => {
        updatePersons();
    }, []);

    const infoMessage = (msg) => {
        setMessage({text: msg, level: 'info-message'});
    };
    const errorMessage = (msg) => {
        setMessage({text: msg, level: 'error-message'});
    };


    const deletePerson = async (person) => {
        if (window.confirm(`Delete ${person.name} ?`)) {
            try {
                // Not the most efficient, but just fetch the list again
                await puhelinluetteloService.deletePerson(person.id);
                await updatePersons();
                infoMessage(`Removed ${person.name}`);
            } catch (error) {
                // In real life these type of catches would be too broad - we would need to
                // look at the error message that the server actually produced
                errorMessage(`Information of ${person.name} has already been removed from server`);
            }
        }
    };


    const updateNumber = async (number, person) => {
        if (person.number !== number) {
            if (window.confirm(`${person.name} is already added to phonebook, replace the old number with a new one?`)) {
                person.number = number;
                await puhelinluetteloService.updatePerson(person);
                await updatePersons();
                infoMessage(`Updated ${person.name}`);
            }
        } else {
            errorMessage(`${newName} is already added to phonebook`)
        }
    };

    const createNewPerson = () => {
        const max = persons.map(p => p.id).reduce((a, b) => a > b ? a : b);
        const add = {name: newName, number: newNumber, id: max + 1};
        return add;
    };

    const addPerson = async (event) => {
        event.preventDefault();
        if (newName) {
            try {
                const add = createNewPerson();

                const person = persons.find(p => p.name === add.name);
                if (person) {
                    await updateNumber(newNumber, person);
                } else {
                    setPersons(persons.concat(add));
                    await puhelinluetteloService.storePerson(add);
                    setMessage({text: `Added ${add.name}`, level: 'info-message'});
                }
            } catch(error) {
                if (error.response.data.error) {
                    errorMessage(error.response.data.error);
                }
            }
        }
    };


    return (
        <div>
            <h2>Phonebook</h2>
            <Notification message={message}/>
            <div>filter shown with <input onChange={(e) => setFilter(e.target.value)} value={filter}/></div>

            <PersonForm addPerson={addPerson} setNewName={setNewName} setNewNumber={setNewNumber}/>
            <h2>Numbers</h2>
            <Persons persons={persons} delete={deletePerson} filter={filter}/>
        </div>
    )

};

export default App
