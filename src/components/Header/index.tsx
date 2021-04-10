
import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
    return(

        <header className={ styles.header }>

            <div className={ commonStyles.container}>

                <figure>
                    
                    <Link href="/">

                        <a><img src="/images/logo.png" alt="logo"/></a>

                    </Link>

                </figure>

            </div>

        </header>

    )
}
