import { useState } from "react";

export default function Bookmark(props) {

    const MAX_BOOKMARK_LEN = 10;

    const { searchTerm, setSearchTerm } = props

    const [bookmarks, setBookmarks] = useState(getBookmarks());

    const addToBookmarks = () => {
        if (!searchTerm) return;

        let trimmedSearchTerm = searchTerm.slice(0, 50)   // avoid too long text
        let nextBookmarks = [...bookmarks, trimmedSearchTerm]
        nextBookmarks = [...new Set(nextBookmarks)] // remove duplicate
        nextBookmarks = nextBookmarks.slice(-MAX_BOOKMARK_LEN)     // keep the latest up to
        localStorage.setItem('bookmarks', JSON.stringify(nextBookmarks));
        setBookmarks(getBookmarks())
    }

    const clearBookmarks = () => {
        localStorage.setItem('bookmarks', JSON.stringify([]));
        setBookmarks(getBookmarks())
    }

    const updateSearchTerm = (str) => {
        setSearchTerm(str);
    }

    return (
        <div className="mt-2">
            <div className='action-buttons flex justify-end gap-3'>
                <button className='p-1 w-32 btn btn-success' onClick={() => addToBookmarks()}>Bookmark！</button>
                <button className='p-1 w-32 btn btn-error' onClick={() => clearBookmarks()}>Clear</button>
            </div>

            <div className='bookmark-list mt-1 flex flex-wrap gap-3'>
                {bookmarks.map(str =>
                    <div
                        key={str}
                        className="p-2 btn btn-warning"
                        onClick={() => updateSearchTerm(str)}
                    > {str}
                    </div>
                )}
            </div>
        </div>
    );
}

function getBookmarks() {
    return () => {
        let localCache = localStorage.getItem("bookmarks");
        if (!localCache) return [];
        return JSON.parse(localCache);
    };
}