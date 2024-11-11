import './AdminList.css';
import AdminService from '../../services/AdminUsersService';
import { useState, useEffect } from 'react';
import img from '../../assets/images/arrow.jpg';
import rab1 from '../../assets/images/rab1.jpg';
import rab2 from '../../assets/images/rab2.jpg';
import rab3 from '../../assets/images/rab3.jpg';
import rab4 from '../../assets/images/rab4.jpg';
import sort from '../../assets/images/sort.png';
import '../home/home.css';
import SideBar from '../../components/sidebar/sidebar';
/*const users = [
    { name: 'John', lastName: 'Doe', email: 'john.doe@example.com', numberOfPosts: 5, numberOfFollowings: 10 },
    { name: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', numberOfPosts: 8, numberOfFollowings: 15 },
    { name: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', numberOfPosts: 3, numberOfFollowings: 7 },
    { name: 'Bob', lastName: 'Brown', email: 'bob.brown@example.com', numberOfPosts: 2, numberOfFollowings: 5 },
    { name: 'Charlie', lastName: 'Davis', email: 'charlie.davis@example.com', numberOfPosts: 6, numberOfFollowings: 8 },
    { name: 'Emily', lastName: 'Clark', email: 'emily.clark@example.com', numberOfPosts: 7, numberOfFollowings: 12 },
    { name: 'Frank', lastName: 'Wilson', email: 'frank.wilson@example.com', numberOfPosts: 4, numberOfFollowings: 9 },
];*/

const maxNum = 5;

function AdminList() {
    console.log("AdminList rendered");
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const result = await AdminService.getAll('admin/users');
            setUsers(result);
          } catch (error) {
            console.error("Error fetching users", error);
          }
        };
    
        fetchUsers();
      }, []);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [minPosts, setMinPosts] = useState('');
    const [maxPosts, setMaxPosts] = useState('');
    const [sortCriteria, setSortCriteria] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [flag, setFlag] = useState(false);

    const filteredUsers = users.filter(user => {
        const matchesCriteria1 = 
            user.firstName.toLowerCase().match(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().match(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().match(searchTerm.toLowerCase());
        
        const matchesCriteria2 = 
            (minPosts === '' || user.numberOfPosts >= parseInt(minPosts)) &&
            (maxPosts === '' || user.numberOfPosts <= parseInt(maxPosts));

        return matchesCriteria1 && matchesCriteria2;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortCriteria === 'followingsAsc') {
            return a.numberOfFollowings - b.numberOfFollowings;
        } else if (sortCriteria === 'followingsDesc') {
            return b.numberOfFollowings - a.numberOfFollowings;
        }
        else if (sortCriteria === 'emailAsc') {
            return a.email.localeCompare(b.email);
        }else if (sortCriteria === 'emailDesc') {
            return a.email.localeCompare(b.email) * -1;
        }
        return 0;
    });


    const pages = Math.ceil(sortedUsers.length / maxNum);
    const firstToShow = currentPage * maxNum;
    const showUsers = sortedUsers.slice(firstToShow, firstToShow + maxNum);

    function nextPage() {
        setCurrentPage(prev => prev + 1); 
    }
    
    function prevPage() {
        setCurrentPage(prev => prev - 1);
    }

    return (

        <div className="page">
                    
            <div className="search">
                <input
                    placeholder="Search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <input
                    placeholder="Min posts"
                    type="number"
                    value={minPosts}
                    onChange={e => setMinPosts(e.target.value)}
                />
                <input
                    placeholder="Max posts" 
                    type="number"
                    value={maxPosts}
                    onChange={e => setMaxPosts(e.target.value)}
                /> 
                <button className="sortB" onClick={()=>setFlag(prev => !prev)}><img src={sort} className="sortImg"></img></button>               
             {flag && (
                <div className="sort" >
                    <button onClick={() => setSortCriteria('followingsAsc')}>Sort by followings ascending</button>
                    <button onClick={() => setSortCriteria('followingsDesc')}>Sort by followings descending</button>
                    <button onClick={() => setSortCriteria('emailAsc')}>Sort by email ascending</button>
                    <button onClick={() => setSortCriteria('emailDesc')}>Sort by email descending</button>
                </div>
            )}
            </div>

            <div className="Admin">
                <div className="center-container">
                    <h1>List of Registered Users</h1>
                </div>
                <div className="buttons">
                    <button onClick={prevPage} disabled={currentPage === 0}>
                        <img src={img} className="ii" alt="Prev" />
                    </button>
                    <button onClick={nextPage} disabled={currentPage === pages - 1}>
                        <img src={img} alt="Next" />
                    </button>
                </div>
                <div className="tabela">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Number of Posts</th>
                                <th>Number of Followings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {showUsers.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.firstName} {user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.numberOfPosts}</td>
                                    <td>{user.numberOfFollowing}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                   
                </div>
            </div>
            <div className="rabbit-container">
                <img src={rab1} alt="Rabbit 1" className="rabbit rabbit-1" />
                <img src={rab2} alt="Rabbit 2" className="rabbit rabbit-2" />
                <img src={rab3} alt="Rabbit 3" className="rabbit rabbit-3" />
                <img src={rab4} alt="Rabbit 4" className="rabbit rabbit-4" />
                <img src={rab1} alt="Rabbit 5" className="rabbit rabbit-5" />
                <img src={rab2} alt="Rabbit 6" className="rabbit rabbit-6" />
                <img src={rab3} alt="Rabbit 7" className="rabbit rabbit-7" />
                <img src={rab4} alt="Rabbit 8" className="rabbit rabbit-8" />
                <img src={rab1} alt="Rabbit 9" className="rabbit rabbit-9" />
                <img src={rab2} alt="Rabbit 10" className="rabbit rabbit-10" />
                <img src={rab3} alt="Rabbit 11" className="rabbit rabbit-11" />
                <img src={rab4} alt="Rabbit 12" className="rabbit rabbit-12" />
            </div>
        </div>
    );
}

export default AdminList;
