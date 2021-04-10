import { Fragment, useEffect, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import PrismicDOM from 'prismic-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { FaCalendarAlt, FaUserCircle, FaClock } from 'react-icons/fa';

interface Post {
    first_publication_date: string | null;
    data: {
        title: string;
        banner: {
            url: string;
        };
        author: string;
        content: {
            heading: string;
            body: {
                text: string;
            }[];
        }[];
    };
}

interface PostProps {
    post: Post;
}

export default function Post({ post }: PostProps) {

    const averageWordReading = 200;
    const router = useRouter();

    const calculateReadingTime = () => {

        let totalWords = post.data.content.reduce((acummulator, content) => {
                
            const sizeHeading = content.heading.split(' ').length;
            const sizeContent = PrismicDOM.RichText.asText(content.body).split(' ').length;
            
            acummulator += sizeHeading + sizeContent;

            return acummulator;

        }, 0);   

        return Math.ceil(totalWords / averageWordReading);
    }

    if(router.isFallback) return(<p>Carregando...</p>); 

    return(

        <Fragment>

            <Header />

            <article className={ styles.post }>

                <figure className={ styles.banner }>
                    <img src={ post.data.banner.url } alt={ post.data.title } />
                </figure>

                <div className={ commonStyles.container }>

                    <h1>{ post.data.title }</h1>

                    <div className={ styles.informations }>
                        <time>

                            <FaCalendarAlt/>
                            { format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR }) }

                        </time>
                        <cite>

                            <FaUserCircle />
                            { post.data.author }

                        </cite>
                        <time>
                            <FaClock/>
                            { 
                                `${calculateReadingTime()} min`
                            }                       
                        </time>
                    </div>

                    {

                        post &&
                        post.data.content.map((content, index) => (

                            <div className={ styles.content } key={`content-${index}`}>
                                
                                <strong className={ styles.title }>{ content.heading }</strong>
                                
                                <div 
                                    dangerouslySetInnerHTML={{ __html: PrismicDOM.RichText.asHtml(content.body) }} />

                            </div>

                        ))

                    }

                </div>
                    
            </article>
        
        
        </Fragment>

    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const prismic = getPrismicClient();
    
    const posts = await prismic.query(
        Prismic.Predicates.at('document.type', 'post')
    );

    const paths = posts.results.map(path => (
        {
            "params": {
                "slug": path.uid 
            }
        }
    ));

    return {
        paths,
        fallback: true
    }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {

    const { slug } = params;    

    const prismic = getPrismicClient();

    const response = await prismic.getByUID('post', String(slug), {});

    const post = {
        uid: response.uid,
        first_publication_date: response.first_publication_date,
        data: {
            title: response.data.title,
            subtitle: response.data.subtitle,
            banner: {
                url: response.data.banner.url,
            },
            author: response.data.author,
            content: response.data.content.map(content => (
                {
                    heading: content.heading,
                    body: content.body
                }
            ))
        }
    }

    return {
        props: {
            post
        }
    }
};
