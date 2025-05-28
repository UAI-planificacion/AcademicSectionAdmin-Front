import styles from './Loader.module.css';

export default function Loading() {
    return (
		<div className="min-h-[50vh] flex justify-center items-center">
			<div className={styles.loader}>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			</div>
		</div>
    )
}
