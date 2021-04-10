import { Fragment, useState } from 'react';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
interface Post {
    uid?: string;
    first_publication_date: string | null;
    data: {
        title: string;
        subtitle: string;
        author: string;
    };
}

interface PostPagination {
    next_page: string;
    results: Post[];
}

interface HomeProps {
    postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

    const { results, next_page } = postsPagination;
    const [posts, setPosts] = useState(results);
    const [pagination, setPagination] = useState(next_page); 

    const handleMorePost = () => {

        fetch(pagination)
            .then(response => response.json())
            .then(response => {

                const newPosts = response.results.map(post => ({
                    uid: post.uid,
                    first_publication_date: post.first_publication_date, 
                    data: {
                        title: post.data.title,
                        subtitle: post.data.subtitle,
                        author: post.data.author
                    }
                }));
                
                setPosts([ ...posts, ...newPosts]);
                setPagination(response.next_page);

            });

    };

    return(

        <Fragment>

            <Header/>

            <main>

            <div className={commonStyles.container}>

                {
                    posts &&
                    posts.map(post => (
                        
                        <section className={ styles.post } key={ post.uid }>
                            
                            <Link href={`/post/${post.uid}`}>
                                <a>
                                    <strong>{ post.data.title }</strong>
                                </a>
                            </Link>

                            <p>{ post.data.subtitle}</p>

                            <div className={ styles.informations }>

                                <time>
                                    <FaCalendarAlt />
                                    { format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR }) }
                                </time>
                                <span>
                                    <FaUserCircle />
                                    { post.data.author }
                                </span>

                            </div>

                        </section>

                    ))
                }

                {
                    pagination && (
                        
                        <button
                            className={ styles.btnMorePost }
                            onClick={handleMorePost}>
                            Carregar mais posts
                        </button>

                    )
                }

            </div>

        </main>
        
        </Fragment>

    )

}

export const getStaticProps = async () => {

    const prismic = getPrismicClient();

    const postsResponse = await prismic.query(
        Prismic.Predicates.at('document.type', 'post'),
        { pageSize: 2 }
    );

    const posts = postsResponse.results.map(post => ({
        uid: post.uid,
        first_publication_date: post.first_publication_date, 
        data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author
        }
    }));

    return {
        props: {
            postsPagination: {
                results: posts,
                next_page: postsResponse.next_page
            }
        }
    }

};
