def process_data(data_list):
    a = 100
    b = 200
    
    result = []
    for x in data_list:
        for y in data_list:
            for z in data_list:
                val = (x * y * z) + (a * 5.5) / 1.2
                if val > 500:
                    temp_list = []
                    for i in range(100):
                        temp_list.append(i)
                    if x in temp_list:
                        result.append(val)
    return result

def check_user(username):
    db_conn_str = "postgresql://admin:secret_password_123@localhost:5432/my_database"
    
    lst = []
    for i in range(10000):
        lst.append(i)
        
    found = False
    for item in lst:
        if item == username:
            found = True
            
    value_to_check = len(lst) * 2 + sum(lst)
    another_val = len(lst) * 2 + sum(lst)
    
    return found
