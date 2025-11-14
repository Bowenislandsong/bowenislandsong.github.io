#include "mm.h"        // prototypes of functions implemented in this file
#include "mm_list.h"   // "mm_list_..."  functions -- to manage explicit free list
#include "mm_block.h"  // "mm_block_..." functions -- to manage blocks on the heap
#include "memlib.h"    // mem_sbrk -- to extend the heap
#include <string.h>    // memcpy -- to copy regions of memory
#ifdef DEBUG
#include <stdio.h>
#endif

#define MAX(x, y) ((x) > (y) ? (x) : (y))
#define MIN(x, y) ((x) > (y) ? (y) : (x))

// next-fit rover to speed up search
static BlockHeader *rover = NULL;

/**
 * Mark a block as free, coalesce with contiguous free blocks on the heap, add
 * the coalesced block to the free list.
 *
 * @param bp address of the block to mark as free
 * @return the address of the coalesced block
 */
static BlockHeader *free_coalesce(BlockHeader *bp) {

    // mark block as free
    int size = mm_block_size(bp);
    mm_block_set_header(bp, size, 0);
    mm_block_set_footer(bp, size, 0);

    // check whether contiguous blocks are allocated
    int prev_alloc = mm_block_allocated(mm_block_prev(bp));
    int next_alloc = mm_block_allocated(mm_block_next(bp));

    if (prev_alloc && next_alloc) {
        // add bp to free list as a standalone free block
    mm_list_prepend(bp);
    rover = bp;
        return bp;

    } else if (prev_alloc && !next_alloc) {
        // coalesce with next block: remove next from free list, merge sizes
        BlockHeader *next = mm_block_next(bp);
    mm_list_remove(next);
        int new_size = size + mm_block_size(next);
        mm_block_set_header(bp, new_size, 0);
        mm_block_set_footer(bp, new_size, 0);
    // add the merged block to free list
    mm_list_prepend(bp);
    rover = bp;
        return bp;

    } else if (!prev_alloc && next_alloc) {
        // coalesce with previous block: previous is already in the free list
    BlockHeader *prev = mm_block_prev(bp);
        int new_size = mm_block_size(prev) + size;
        mm_block_set_header(prev, new_size, 0);
        mm_block_set_footer(prev, new_size, 0);
    rover = prev;
        return prev;

    } else {
        // both prev and next are free: remove next from free list, merge all into prev
        BlockHeader *prev = mm_block_prev(bp);
        BlockHeader *next = mm_block_next(bp);
        mm_list_remove(next);
        int new_size = mm_block_size(prev) + size + mm_block_size(next);
        mm_block_set_header(prev, new_size, 0);
        mm_block_set_footer(prev, new_size, 0);
        rover = prev;
        return prev;
    }
}

/**
 * Allocate a free block of `size` byte (multiple of 8) on the heap.
 *
 * @param size number of bytes to allocate (a multiple of 8)
 * @return pointer to the header of the allocated block
 */
static BlockHeader *extend_heap(int size) {

    // bp points to the beginning of the new block
    char *bp = mem_sbrk(size);
    if ((long)bp == -1)
        return NULL;

    // write header over old epilogue, then the footer
    BlockHeader *old_epilogue = (BlockHeader *)bp - 1;
    mm_block_set_header(old_epilogue, size, 0);
    mm_block_set_footer(old_epilogue, size, 0);

    // write new epilogue
    mm_block_set_header(mm_block_next(old_epilogue), 0, 1);

    // merge new block with previous one if possible
    return free_coalesce(old_epilogue);
}

int mm_init(void) {

    // init list of free blocks
    mm_list_init();

    // create empty heap of 4 x 4-byte words
    char *new_region = mem_sbrk(16);
    if ((long)new_region == -1)
        return -1;

    heap_blocks = (BlockHeader *)new_region;
    mm_block_set_header(heap_blocks, 0, 0);      // skip 4 bytes for alignment
    mm_block_set_header(heap_blocks + 1, 8, 1);  // allocate a block of 8 bytes as prologue
    mm_block_set_footer(heap_blocks + 1, 8, 1);
    mm_block_set_header(heap_blocks + 3, 0, 1);  // epilogue (size 0, allocated)
    heap_blocks += 1;                            // point to the prologue header

    // extend heap with an initial heap size
    const int CHUNK_SIZE = 1 << 12; // 4KB initial chunk
    if (extend_heap(CHUNK_SIZE) == NULL) {
        return -1;
    }
    rover = mm_list_headp;

    return 0;
}

void mm_free(void *bp) {
    if (bp == NULL)
        return;
    BlockHeader *bh = (BlockHeader *)bp - 1;
    free_coalesce(bh);
}

/**
 * Find a free block with size greater or equal to `size`.
 *
 * @param size minimum size of the free block
 * @return pointer to the header of a free block or `NULL` if free blocks are
 *         all smaller than `size`.
 */
static BlockHeader *find_fit(int size) {
    BlockHeader *start = rover ? rover : mm_list_headp;
    // first scan from start to end
    for (BlockHeader *p = start; p != NULL; p = mm_list_next(p))
        if (mm_block_size(p) >= size)
            return (rover = p);
    // then wrap from head to start
    for (BlockHeader *p = mm_list_headp; p != start; p = mm_list_next(p))
        if (mm_block_size(p) >= size)
            return (rover = p);
    return NULL;
}

/**
 * Allocate a block of `size` bytes inside the given free block `bp`.
 *
 * @param bp pointer to the header of a free block of at least `size` bytes
 * @param size bytes to assign as an allocated block (multiple of 8)
 * @return pointer to the header of the allocated block
 */
static BlockHeader *place(BlockHeader *bp, int size) {
    int curr_size = mm_block_size(bp);

    // remove current block from free list (we're consuming it)
    mm_list_remove(bp);

    int leftover = curr_size - size;
    // Minimum block size is 16 bytes (header+footer+min payload)
    if (leftover >= 16) {
        // allocate the first 'size' bytes
        mm_block_set_header(bp, size, 1);
        mm_block_set_footer(bp, size, 1);

        // create a new free block with the leftover
        BlockHeader *nbp = mm_block_next(bp);
        mm_block_set_header(nbp, leftover, 0);
        mm_block_set_footer(nbp, leftover, 0);
        mm_list_prepend(nbp);
        rover = nbp;
        return bp;
    } else {
        // not enough space to split: allocate entire block
        mm_block_set_header(bp, curr_size, 1);
        mm_block_set_footer(bp, curr_size, 1);
        rover = mm_list_headp; // keep rover valid
        return bp;
    }
}

/**
 * Compute the required block size (including space for header/footer) from the
 * requested payload size.
 *
 * @param payload_size requested payload size
 * @return a block size including header/footer that is a multiple of 8
 */
static int required_block_size(int payload_size) {
    payload_size += 8;                    // add 8 for for header/footer
    return ((payload_size + 7) / 8) * 8;  // round up to multiple of 8
}

void *mm_malloc(size_t size) {
    // ignore spurious requests
    if (size == 0)
        return NULL;

    int required_size = required_block_size(size);

    // find a free block
    BlockHeader *bp = find_fit(required_size);
    if (bp == NULL) {
        // extend heap: take the max to avoid many small sbrk calls
        const int CHUNK_SIZE = 1 << 12; // 4KB
        int extend_size = MAX(required_size, CHUNK_SIZE);
        bp = extend_heap(extend_size);
        if (bp == NULL)
            return NULL;
    }

    BlockHeader *placed = place(bp, required_size);
    return mm_block_payload_addr(placed);
}

void *mm_realloc(void *ptr, size_t size) {

    if (ptr == NULL) {
        // equivalent to malloc
        return mm_malloc(size);

    } else if (size == 0) {
        // equivalent to free
        mm_free(ptr);
        return NULL;

    } else {
        BlockHeader *oldh = (BlockHeader *)ptr - 1;
        int old_total = mm_block_size(oldh);
        int new_total = required_block_size((int)size);

        // Shrink in place if possible
        if (new_total <= old_total) {
            int leftover = old_total - new_total;
            if (leftover >= 16) {
                mm_block_set_header(oldh, new_total, 1);
                mm_block_set_footer(oldh, new_total, 1);
                BlockHeader *tail = mm_block_next(oldh);
                mm_block_set_header(tail, leftover, 0);
                mm_block_set_footer(tail, leftover, 0);
                free_coalesce(tail);
            }
            return ptr;
        }

        // Try to grow into the epilogue by extending the heap (safe in-place)
        BlockHeader *next = mm_block_next(oldh);
        if (mm_block_size(next) == 0 && mm_block_allocated(next) == 1) {
            int need = new_total - old_total;
            char *res = mem_sbrk(need);
            if ((long)res != -1) {
                mm_block_set_header(oldh, new_total, 1);
                mm_block_set_footer(oldh, new_total, 1);
                mm_block_set_header(mm_block_next(oldh), 0, 1); // new epilogue
                return ptr;
            }
        }

        // Fallback: allocate-copy-free
        size_t old_payload = (size_t)(old_total - 8);
        void *new_ptr = mm_malloc(size);
        if (new_ptr == NULL)
            return NULL;
        size_t to_copy = MIN(old_payload, size);
        memcpy(new_ptr, ptr, to_copy);
        mm_free(ptr);
        return new_ptr;
    }
}
