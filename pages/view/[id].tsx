import { useRouter } from 'next/router';
import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from '../../styles/globals.module.css';

const ViewNote: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Mendapatkan ID dari query parameter
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchNote = async () => {
        try {
          const response = await axios.get(`https://gonobe.belajar-it.org/getNotesById/${id}`);
          setNote(response.data);
          console.log(note);
        } catch (error) {
          console.error('Error fetching note:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchNote();
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!note) return <p>Note not found</p>;

  return (
    <div className={styles.container}>
      <center>
        <h1>Mini-X</h1>
        <p>Inspired by X</p>
      </center>

      <div className={styles.box}>
        <h4>@{note.username}</h4>

        <div className={styles.content}>
          {note.notes}
        </div>

        <div id={styles.tagsContainer}>
            {note.tags && note.tags.split(',').map((tag, index) => (
                <div key={index} className={styles.tag}>
                    {tag}
                </div>
            ))}
        </div>

        <footer className={styles.footer}>
          <small>{note.time}</small>
        </footer>

        <br/>

        <center><a type="submit" className={styles.button} href={`/`}>Back home</a></center>
      </div>

    </div>
  );
};

export default ViewNote;
