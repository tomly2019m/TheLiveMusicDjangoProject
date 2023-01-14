list_len = int(input())
arr_list = input().split(' ')
n = 0
for i, elem_i in enumerate(arr_list[:-1], 1):
    elem_i = int(elem_i)
    new_list = arr_list[i:]
    for j, elem_j in enumerate(new_list, i + 1):
        elem_j = int(elem_j)
        m = abs(i - j) + abs(elem_i - elem_j)
        print(m)
        if m > n:
            n = m
print(n, m)
