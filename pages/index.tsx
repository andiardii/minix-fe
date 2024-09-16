import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/globals.module.css';

const Home: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [showMenu, setShowMenu] = useState<{ [key: number]: boolean }>({});
  const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editNote, setEditNote] = useState('');
  const [tagsVisibility, setTagsVisibility] = useState<{ [key: number]: boolean }>({});

  const toggleMenu = (index: number) => {
    setShowMenu((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleClickOutside = (event: MouseEvent) => {
    Object.values(menuRefs.current).forEach((ref) => {
      if (ref && !ref.contains(event.target as Node)) {
        setShowMenu((prevState) => ({
          ...prevState,
          [Object.keys(menuRefs.current).find(key => ref === menuRefs.current[key]) as unknown as number]: false,
        }));
      }
    });
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  const handleCancelEdit = (id: number) => {
    setIsEditing(null);
    setTagsVisibility(prev => ({
      ...prev,
      [id]: true,
    }));
  };  

  const fetchData = async () => {
    try {
      const response = await axios.get('https://gonobe.belajar-it.org/getNotesByUser/1');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (note.trim() !== '') {
      try {
        await axios.post('https://gonobe.belajar-it.org/updateNotes', { note }, { headers: { 'Content-Type': 'application/json' } });
        fetchData();
        setNote('');
      } catch (error) {
        console.error('Error posting data:', error);
      }
    }
  };

  useEffect(() => {
    console.log('isEditing updated:', isEditing);
  }, [isEditing]);

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>, id: number) => {
    e.preventDefault();
    try {
      await axios.post('https://gonobe.belajar-it.org/updateNotes', { id, note: editNote }, { headers: { 'Content-Type': 'application/json' } });
      setIsEditing(null);
      fetchData();
    } catch (error) {
      console.error('Error updating note:', error);
    }

    setTagsVisibility(prev => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleDelete = async (e: React.MouseEvent<HTMLAnchorElement>, id: number) => {
    e.preventDefault();
    try {
      await axios.delete(`https://gonobe.belajar-it.org/deleteNotes/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <center>
        <h1>Mini-X</h1>
        <p>Inspired by X</p>
      </center>

      <div className={styles.boxContainer}>
        <div className={styles.box}>
          <h4>Add Notes</h4>
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <textarea
              placeholder="Write your own words..."
              className={styles.textarea}
              value={note}
              onChange={handleInputChange}
              rows={1}
            />
            <button type="submit" className={styles.button}>Save</button>
          </form>
        </div>

        {data.length > 0 ? (
          data.map((item) => (
            <div className={styles.box} key={item.id}>
              <div className={styles.header}>
                <h4>@{item.username}</h4>
                <button
                  className={styles.moreButton}
                  onClick={() => toggleMenu(item.id)}
                >
                  ⋮
                </button>
                {showMenu[item.id] && (
                  <div
                    className={styles.dropdownMenu}
                    ref={(ref) => menuRefs.current[item.id] = ref}
                  >
                    <ul>
                      <li><a href={`/view/${item.id}`}>View</a></li>
                      <li>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            const tagsPart = item.tags
                                            ? item.tags
                                                .split(',')
                                                .map(tag => `#${tag.trim()}`)
                                                .join(' ')
                                            : '';
                            const formattedNote = `${item.notes} ${tagsPart}`.trim();
                            
                            setIsEditing(item.id);
                            setEditNote(formattedNote);
                            setTagsVisibility(prev => ({
                              ...prev,
                              [item.id]: false,
                            }));
                          }}
                        >
                          Edit
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => handleDelete(e, item.id)}>Delete</a>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {isEditing === item.id ? (
                <form onSubmit={(e) => handleEditSubmit(e, item.id)}>
                  <textarea
                    className={styles.textarea}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    rows={5}
                  />
                  <button type="submit" className={styles.button} style={{ marginRight: '10px' }}>Save</button>
                  <button type="button" onClick={() => handleCancelEdit(item.id)} className={styles.button}>Cancel</button>
                </form>
              ) : (
                <div className={styles.content}>
                  {item.notes.split('\n').map((line, index) => (
                    <p key={index}>
                      {line}
                      <br />
                    </p>
                  ))}
                </div>
              )}

              {tagsVisibility[item.id] !== false && (
                <div id={styles.tagsContainer}>
                  {item.tags && item.tags.split(',').map((tag, index) => (
                    <div key={index} className={styles.tag}>
                      {tag}
                    </div>
                  ))}
                </div>
              )}

              <footer className={styles.footer}>
                <small>{item.time}</small>
              </footer>
            </div>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default Home;
